import { normalizeInput } from "./typing";
import type { NonEmpty } from "../content/lessons";
import { shuffleWithSeed } from "./random";

export const challengeDurationMs = 30_000;

export type ChallengeState =
  | { phase: "ready" }
  | { phase: "running"; words: NonEmpty<string>; startedAt: number; now: number; solved: number; input: string; missed: boolean }
  | { phase: "finished"; solved: number; elapsedMs: number; timedOut: boolean };

export type ChallengeAction =
  | { type: "start"; at: number; seed: number }
  | { type: "tick"; at: number }
  | { type: "input"; input: string; at: number }
  | { type: "submit"; at: number }
  | { type: "stop"; at: number };

export function targetWord(words: NonEmpty<string>, solved: number): string {
  return words[solved % words.length] ?? words[0];
}

export function advanceChallenge(
  words: NonEmpty<string>,
  state: ChallengeState,
  action: ChallengeAction,
): ChallengeState {
  if (action.type === "start" && state.phase !== "running") {
    return {
      phase: "running",
      words: shuffleWithSeed(words, action.seed),
      startedAt: action.at,
      now: action.at,
      solved: 0,
      input: "",
      missed: false,
    };
  }
  if (state.phase !== "running" || action.type === "start") return state;

  const elapsedMs = Math.max(0, action.at - state.startedAt);
  const timedOut = elapsedMs >= challengeDurationMs;
  if (timedOut || action.type === "stop") {
    return {
      phase: "finished",
      solved: state.solved,
      elapsedMs: Math.min(challengeDurationMs, elapsedMs),
      timedOut,
    };
  }

  switch (action.type) {
    case "tick":
      return { ...state, now: action.at };
    case "input":
      return { ...state, now: action.at, input: normalizeInput(action.input), missed: false };
    case "submit":
      return state.input === targetWord(state.words, state.solved)
        ? { ...state, now: action.at, solved: state.solved + 1, input: "", missed: false }
        : { ...state, now: action.at, missed: true };
  }
}
