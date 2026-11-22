import { useCallback, useReducer } from "react";
import type { Activity, PositionActivity, TextActivity, TextLesson } from "../content/lessons";
import { longPassageEntry, shortPassageEntry } from "../content/passages";
import type { PassageActivity, PassageLength } from "../content/passages";
import {
  createPassageSession,
  submitPassageLine,
  updatePassageInput,
} from "../domain/passagePractice";
import type { PassageSession } from "../domain/passagePractice";
import { createPositionSession, pressPosition, scorePositions } from "../domain/positions";
import type { PositionKey, PositionSession } from "../domain/positions";
import { calculateTypingScore, createPracticeSession, hasReachedEnd, reducePracticeSession } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import type { PracticeRecord } from "../domain/history";

export const historyEntry = { id: "history", label: "최근 연습 기록", kind: "history" } as const;
export const challengeEntry = { id: "challenge", label: "30초 낱말 도전", kind: "challenge" } as const;
export const veniceEntry = { id: "venice", label: "베네치아", kind: "venice" } as const;
export const freePracticeEntry = { id: "free-practice", label: "연습장", kind: "free-practice" } as const;
export const settingsEntry = { id: "settings", label: "환경설정", kind: "settings" } as const;
export const passageEntries = [shortPassageEntry, longPassageEntry] as const;

/** Position of a word drill inside its word list, kept so the result can offer the next word. */
export type WordProgress = { index: number; total: number; title: string };

export type PracticeContentState =
  | { screen: "menu"; selected: string | null }
  | { screen: "library"; length: PassageLength; selected: string | null }
  | { screen: "history" }
  | { screen: "challenge" }
  | { screen: "venice" }
  | { screen: "free-practice" }
  | {
      screen: "practice";
      activity: TextActivity;
      lesson: TextLesson;
      index: number;
      round: number;
      session: PracticeSession;
      previous: TypingScore | null;
    }
  | { screen: "positions"; activity: PositionActivity; session: PositionSession }
  | { screen: "passage"; activity: PassageActivity; session: PassageSession }
  | {
      screen: "result";
      activity: Activity | PassageActivity;
      score: TypingScore;
      // Word drills review one word at a time; other modes finish the whole activity.
      wordProgress: WordProgress | null;
    };

export type PracticeState =
  | PracticeContentState
  | { screen: "settings"; returnState: PracticeContentState };

type CompletionTime = { id: string; completedAt: number; at: number };
export type AppAction =
  | { type: "start"; activity: Activity | PassageActivity }
  | { type: "open-library"; length: PassageLength }
  | { type: "open-history" }
  | { type: "open-settings" }
  | { type: "close-settings" }
  | { type: "open-challenge" }
  | { type: "open-venice" }
  | { type: "open-free-practice" }
  | { type: "input-changed"; input: string; at: number }
  | ({ type: "submit"; input?: string } & CompletionTime)
  | ({ type: "position-key"; key: PositionKey } & CompletionTime)
  | { type: "finish" }
  | { type: "return-to-menu" }
  | { type: "continue" }
  | { type: "retry" };

function startLesson(activity: TextActivity, index: number, round: number): PracticeState {
  return {
    screen: "practice",
    activity,
    lesson: activity.lessons[index] ?? activity.lessons[0],
    index,
    round,
    session: createPracticeSession(),
    previous: null,
  };
}

function startActivity(activity: Activity | PassageActivity): PracticeState {
  if (activity.kind === "passage") {
    return { screen: "passage", activity, session: createPassageSession() };
  }
  if (activity.kind === "position") {
    return { screen: "positions", activity, session: createPositionSession() };
  }
  return startLesson(activity, 0, 0);
}

function reduceTextPractice(
  state: Extract<PracticeState, { screen: "practice" }>,
  action: AppAction,
): PracticeState {
  if (action.type === "input-changed") {
    return { ...state, session: reducePracticeSession(state.session, action) };
  }
  if (action.type === "finish" && state.previous) {
    return { screen: "result", activity: state.activity, score: state.previous, wordProgress: null };
  }
  if (action.type !== "submit") return state;
  const session = action.input === undefined
    ? state.session
    : reducePracticeSession(state.session, { type: "input-changed", input: action.input, at: action.at });
  if (!hasReachedEnd(state.lesson.text, session.input)) return state;

  const completed = reducePracticeSession(session, { type: "submitted", at: action.at });
  const score = calculateTypingScore(state.lesson.text, completed, action.at, state.lesson.language);
  if (state.activity.kind === "word") {
    // A word drill reviews each word, so the result offers the next word instead of ending the activity.
    return {
      screen: "result",
      activity: state.activity,
      score,
      wordProgress: { index: state.index, total: state.activity.lessons.length, title: state.lesson.title },
    };
  }
  const index = (state.index + 1) % state.activity.lessons.length;
  return {
    ...state,
    index,
    lesson: state.activity.lessons[index] ?? state.activity.lessons[0],
    round: state.round + 1,
    session: createPracticeSession(),
    previous: score,
  };
}

function reducePassagePractice(state: Extract<PracticeState, { screen: "passage" }>, action: AppAction): PracticeState {
  if (action.type === "input-changed") {
    return { ...state, session: updatePassageInput(state.session, action.input, action.at) };
  }
  if (action.type !== "submit") return state;
  const session = action.input === undefined
    ? state.session
    : updatePassageInput(state.session, action.input, action.at);
  const update = submitPassageLine(state.activity.lines, session, action.at, state.activity.language);
  switch (update.type) {
    case "waiting": return state;
    case "next-line": return { ...state, session: update.session };
    case "completed": return { screen: "result", activity: state.activity, score: update.score, wordProgress: null };
  }
}

export function reducePracticeState(state: PracticeState, action: AppAction): PracticeState {
  if (action.type === "open-settings") {
    if (state.screen === "settings") return state;
    const returnState = state.screen === "menu" ? { ...state, selected: settingsEntry.id } : state;
    return { screen: "settings", returnState };
  }
  if (action.type === "open-library") return { screen: "library", length: action.length, selected: null };
  if (action.type === "open-history") return { screen: "history" };
  if (action.type === "open-challenge") return { screen: "challenge" };
  if (action.type === "open-venice") return { screen: "venice" };
  if (action.type === "open-free-practice") return { screen: "free-practice" };
  if (action.type === "start") return startActivity(action.activity);
  if (state.screen === "menu") return state;
  if (state.screen === "library") {
    return action.type === "return-to-menu"
      ? { screen: "menu", selected: state.length === "short" ? shortPassageEntry.id : longPassageEntry.id }
      : state;
  }
  if (state.screen === "history") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: historyEntry.id } : state;
  }
  if (state.screen === "settings") {
    return action.type === "close-settings" ? state.returnState : state;
  }
  if (state.screen === "challenge") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: challengeEntry.id } : state;
  }
  if (state.screen === "venice") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: veniceEntry.id } : state;
  }
  if (state.screen === "free-practice") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: freePracticeEntry.id } : state;
  }
  if (action.type === "return-to-menu") {
    if (state.screen === "passage") {
      return { screen: "library", length: state.activity.length, selected: state.activity.id };
    }
    if (state.screen === "result" && state.activity.kind === "passage") {
      return { screen: "library", length: state.activity.length, selected: state.activity.id };
    }
    return { screen: "menu", selected: state.activity.id };
  }
  if (state.screen === "result") {
    if (action.type === "retry") {
      // Retrying a word repeats the word just finished; retrying anything else starts from the beginning.
      if (state.wordProgress && state.activity.kind === "word") {
        return startLesson(state.activity, state.wordProgress.index, 0);
      }
      return startActivity(state.activity);
    }
    if (action.type === "continue" && state.wordProgress && state.activity.kind === "word") {
      const next = (state.wordProgress.index + 1) % state.wordProgress.total;
      return startLesson(state.activity, next, 0);
    }
    return state;
  }
  if (state.screen === "practice") return reduceTextPractice(state, action);
  if (state.screen === "passage") return reducePassagePractice(state, action);

  if (state.screen === "positions" && action.type === "position-key") {
    const target = state.activity.keys[state.session.correct];
    if (!target) return state;
    const session = pressPosition(state.session, target, action.key, action.at);
    if (session.correct === state.activity.keys.length) {
      return { screen: "result", activity: state.activity, score: scorePositions(session, action.at), wordProgress: null };
    }
    return { ...state, session };
  }
  return state;
}

type SessionState = {
  screen: PracticeState;
  pending: readonly PracticeRecord[];
  latest: PracticeRecord | null;
};

type SessionAction = AppAction | { type: "saved"; id: string };

function completedRecord(before: PracticeState, after: PracticeState, action: AppAction): PracticeRecord | null {
  if (action.type !== "submit" && action.type !== "position-key") return null;
  if (!("activity" in before) || before.screen === "result") return null;
  const score = after.screen === "result" ? after.score
    : (before.screen === "practice" && after.screen === "practice" && after.round > before.round)
      ? after.previous : null;
  if (!score) return null;
  const mode = before.screen === "passage" ? before.activity.length
    : before.screen === "practice" ? before.activity.kind
      : before.activity.kind;
  return {
    id: action.id,
    materialId: before.screen === "practice" ? before.lesson.id : before.activity.id,
    completedAt: action.completedAt,
    mode,
    language: before.screen === "practice" ? before.lesson.language
      : before.screen === "passage" ? before.activity.language : "ko",
    score,
  };
}

function reduceSessions(state: SessionState, action: SessionAction): SessionState {
  if (action.type === "saved") {
    return { ...state, pending: state.pending.filter((record) => record.id !== action.id) };
  }
  const screen = reducePracticeState(state.screen, action);
  const record = completedRecord(state.screen, screen, action);
  return record
    ? { screen, pending: [...state.pending, record], latest: record }
    : { ...state, screen };
}

export function usePracticeState() {
  const [state, dispatch] = useReducer(reduceSessions, {
    screen: { screen: "menu", selected: null },
    pending: [],
    latest: null,
  });
  const acknowledge = useCallback((id: string) => dispatch({ type: "saved", id }), []);
  return { state: state.screen, pending: state.pending[0], latest: state.latest, dispatch, acknowledge };
}

export function completionTime(at: number): CompletionTime {
  return { id: crypto.randomUUID(), completedAt: Date.now(), at };
}
