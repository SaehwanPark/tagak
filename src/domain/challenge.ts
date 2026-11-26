import { normalizeInput } from "./typing";
import type { NonEmpty } from "../content/lessons";
import { shuffleWithSeed } from "./random";

export const challengeDurationMs = 30_000;

export type ChallengePauseReason = "settings" | "app-inactive";

export type ChallengeState =
  | { phase: "ready" }
  | {
      phase: "running";
      words: NonEmpty<string>;
      now: number;
      elapsedBeforePause: number;
      activeSince: number | null;
      pauseReasons: readonly ChallengePauseReason[];
      solved: number;
      input: string;
      missed: boolean;
    }
  | { phase: "finished"; solved: number; elapsedMs: number; timedOut: boolean };

export type ChallengeAction =
  | { type: "start"; at: number; seed: number }
  | { type: "tick"; at: number }
  | { type: "input"; input: string; at: number }
  | { type: "submit"; at: number }
  | { type: "stop"; at: number }
  | { type: "pause-reason"; reason: ChallengePauseReason; paused: boolean; at: number };

export function targetWord(words: NonEmpty<string>, solved: number): string {
  return words[solved % words.length] ?? words[0];
}

function eventTime(lastAt: number, at: number): number {
  return Number.isFinite(at) ? Math.max(lastAt, 0, at) : lastAt;
}

export function challengeElapsedMs(state: Extract<ChallengeState, { phase: "running" }>, at = state.now): number {
  const safeAt = eventTime(state.now, at);
  return state.elapsedBeforePause + (state.activeSince === null
    ? 0
    : Math.max(0, safeAt - state.activeSince));
}

function finishChallenge(
  state: Extract<ChallengeState, { phase: "running" }>,
  elapsedMs: number,
  timedOut: boolean,
): ChallengeState {
  return {
    phase: "finished",
    solved: state.solved,
    elapsedMs: Math.min(challengeDurationMs, Math.max(0, elapsedMs)),
    timedOut,
  };
}

export function advanceChallenge(
  words: NonEmpty<string>,
  state: ChallengeState,
  action: ChallengeAction,
): ChallengeState {
  if (action.type === "start" && state.phase !== "running") {
    const at = Number.isFinite(action.at) ? Math.max(0, action.at) : 0;
    return {
      phase: "running",
      words: shuffleWithSeed(words, action.seed),
      now: at,
      elapsedBeforePause: 0,
      activeSince: at,
      pauseReasons: [],
      solved: 0,
      input: "",
      missed: false,
    };
  }
  if (state.phase !== "running" || action.type === "start") return state;

  const alreadyPausedForReason = action.type === "pause-reason" && state.pauseReasons.includes(action.reason);
  const safeAt = eventTime(state.now, action.at);
  if (action.type === "pause-reason") {
    if (action.paused === alreadyPausedForReason) return state;
    const elapsedMs = challengeElapsedMs(state, safeAt);
    if (action.paused && elapsedMs >= challengeDurationMs) {
      return finishChallenge(state, challengeDurationMs, true);
    }

    if (action.paused) {
      const pauseReasons = [...state.pauseReasons, action.reason];
      const firstPause = state.pauseReasons.length === 0;
      return {
        ...state,
        now: safeAt,
        elapsedBeforePause: firstPause ? elapsedMs : state.elapsedBeforePause,
        activeSince: firstPause ? null : state.activeSince,
        pauseReasons,
      };
    }

    const pauseReasons = state.pauseReasons.filter((reason) => reason !== action.reason);
    const lastResume = pauseReasons.length === 0;
    return {
      ...state,
      now: safeAt,
      activeSince: lastResume ? safeAt : null,
      pauseReasons,
    };
  }

  if (state.pauseReasons.length > 0 && action.type === "input") {
    return { ...state, input: normalizeInput(action.input), missed: false };
  }
  if (state.pauseReasons.length > 0 && action.type !== "stop") return state;
  const elapsedMs = challengeElapsedMs(state, safeAt);
  const timedOut = elapsedMs >= challengeDurationMs;
  if (timedOut || action.type === "stop") {
    return finishChallenge(state, elapsedMs, timedOut);
  }

  switch (action.type) {
    case "tick":
      return { ...state, now: safeAt };
    case "input":
      return { ...state, now: safeAt, input: normalizeInput(action.input), missed: false };
    case "submit":
      return state.input === targetWord(state.words, state.solved)
        ? { ...state, now: safeAt, solved: state.solved + 1, input: "", missed: false }
        : { ...state, now: safeAt, missed: true };
  }
}
