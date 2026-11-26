import { useCallback, useReducer } from "react";
import type { Activity, TextLesson } from "../content/lessons";
import { longPassageEntry, shortPassageEntry } from "../content/passages";
import type { PassageActivity, PassageLength } from "../content/passages";
import { shuffleWithSeed } from "../domain/random";
import {
  createPassageSession,
  submitPassageLine,
  updatePassageInput,
} from "../domain/passagePractice";
import type { PassageSession } from "../domain/passagePractice";
import { aggregateTypingScores, calculateTypingScore, createPracticeSession, hasReachedEnd, reducePracticeSession } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import type { PracticeRecord, PracticeSessionRecord } from "../domain/history";
import { defaultLinePracticeSessionLength } from "../domain/linePracticeSettings";
import type { LinePracticeSessionLength } from "../domain/linePracticeSettings";

export const gamesEntry = { id: "games", label: "게임", kind: "games" } as const;
export const challengeEntry = { id: "challenge", label: "30초 낱말 도전", kind: "challenge" } as const;
export const veniceEntry = { id: "venice", label: "베네치아", kind: "venice" } as const;
export const settingsEntry = { id: "settings", label: "환경설정", kind: "settings" } as const;
export const passageEntries = [shortPassageEntry, longPassageEntry] as const;
export const linePracticeSessionLength = defaultLinePracticeSessionLength;

export type PracticeContentState =
  | { screen: "menu"; selected: string | null }
  | { screen: "games"; selected: string | null }
  | { screen: "library"; length: PassageLength; selected: string | null }
  | { screen: "challenge" }
  | { screen: "venice" }
  | {
      screen: "practice";
      activity: Activity;
      lesson: TextLesson;
      index: number;
      round: number;
      session: PracticeSession;
      previous: TypingScore | null;
      completedLineScores: readonly TypingScore[];
      lineSessionLength: LinePracticeSessionLength;
    }
  | { screen: "passage"; activity: PassageActivity; session: PassageSession }
  | {
      screen: "result";
      activity: Activity | PassageActivity;
      score: TypingScore;
      lineSessionScores?: readonly TypingScore[];
      lineSessionLength?: LinePracticeSessionLength;
      sessionRecord: PracticeSessionRecord | null;
    };

type SettingsView = "menu" | "history" | "data-transfer";
export type PracticeState =
  | PracticeContentState
  | { screen: "settings"; returnState: PracticeContentState; view: SettingsView; focusRow: string };

type CompletionTime = { id: string; sessionId: string; completedAt: number; at: number };
export type AppAction =
  | { type: "start"; activity: Activity; seed: number; lineSessionLength?: LinePracticeSessionLength }
  | { type: "start-passage"; activity: PassageActivity }
  | { type: "open-library"; length: PassageLength }
  | { type: "open-games" }
  | { type: "open-settings" }
  | { type: "open-settings-history" }
  | { type: "open-settings-data-transfer" }
  | { type: "return-to-settings" }
  | { type: "close-settings" }
  | { type: "open-challenge" }
  | { type: "open-venice" }
  | { type: "input-changed"; input: string; at: number }
  | ({ type: "submit"; input?: string } & CompletionTime)
  | { type: "finish"; sessionId?: string; completedAt?: number }
  | { type: "return-to-menu"; sessionId?: string; completedAt?: number }
  | { type: "retry" }
  | { type: "retry-randomized"; seed: number };

function startLesson(
  activity: Activity,
  index: number,
  round: number,
  lineSessionLength: LinePracticeSessionLength,
): PracticeState {
  return {
    screen: "practice",
    activity,
    lesson: activity.lessons[index] ?? activity.lessons[0],
    index,
    round,
    session: createPracticeSession(),
    previous: null,
    completedLineScores: [],
    lineSessionLength,
  };
}

function startActivity(
  activity: Activity,
  seed: number,
  lineSessionLength = defaultLinePracticeSessionLength,
): PracticeState {
  return startLesson({ ...activity, lessons: shuffleWithSeed(activity.lessons, seed) }, 0, 0, lineSessionLength);
}

function startPassage(activity: PassageActivity): PracticeState {
  return { screen: "passage", activity, session: createPassageSession() };
}

function sessionRecord(
  id: string | undefined,
  completedAt: number | undefined,
  mode: PracticeSessionRecord["mode"],
  language: PracticeSessionRecord["language"],
  materialIds: readonly string[],
  lineSessionLength: LinePracticeSessionLength | null,
  lineScores: readonly TypingScore[],
  completion: PracticeSessionRecord["completion"],
): PracticeSessionRecord | null {
  if (!id || completedAt === undefined || lineScores.length === 0) return null;
  return { id, completedAt, mode, language, materialIds, lineSessionLength, completion, lineScores };
}

function reduceTextPractice(
  state: Extract<PracticeState, { screen: "practice" }>,
  action: AppAction,
): PracticeState {
  if (action.type === "input-changed") {
    return { ...state, session: reducePracticeSession(state.session, action) };
  }
  if (action.type === "finish" && state.previous) {
    const scores = state.completedLineScores;
    return {
      screen: "result",
      activity: state.activity,
      score: aggregateTypingScores(scores, state.lesson.language),
      lineSessionScores: scores,
      lineSessionLength: state.lineSessionLength,
      sessionRecord: sessionRecord(
        action.sessionId,
        action.completedAt,
        "line",
        state.lesson.language,
        state.activity.lessons.slice(0, scores.length).map((lesson) => lesson.id),
        state.lineSessionLength,
        scores,
        "early-exit",
      ),
    };
  }
  if (action.type !== "submit") return state;
  const session = action.input === undefined
    ? state.session
    : reducePracticeSession(state.session, { type: "input-changed", input: action.input, at: action.at });
  if (!hasReachedEnd(state.lesson.text, session.input)) return state;

  const completed = reducePracticeSession(session, { type: "submitted", at: action.at });
  const score = calculateTypingScore(state.lesson.text, completed, action.at, state.lesson.language);
  const completedLineScores = [...state.completedLineScores, score];
  if (completedLineScores.length >= state.lineSessionLength) {
    return {
      screen: "result",
      activity: state.activity,
      score: aggregateTypingScores(completedLineScores, state.lesson.language),
      lineSessionScores: completedLineScores,
      lineSessionLength: state.lineSessionLength,
      sessionRecord: sessionRecord(
        action.sessionId,
        action.completedAt,
        "line",
        state.lesson.language,
        state.activity.lessons.slice(0, completedLineScores.length).map((lesson) => lesson.id),
        state.lineSessionLength,
        completedLineScores,
        "completed",
      ),
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
    completedLineScores,
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
    case "completed": return {
      screen: "result",
      activity: state.activity,
      score: update.score,
      lineSessionScores: update.lineScores,
      sessionRecord: sessionRecord(
        action.sessionId,
        action.completedAt,
        state.activity.length,
        state.activity.language,
        [state.activity.id],
        null,
        update.lineScores,
        "completed",
      ),
    };
  }
}

export function reducePracticeState(state: PracticeState, action: AppAction): PracticeState {
  if (action.type === "open-settings") {
    if (state.screen === "settings") return state;
    const returnState = state.screen === "menu" ? { ...state, selected: settingsEntry.id } : state;
    return { screen: "settings", returnState, view: "menu", focusRow: "interface-language" };
  }
  if (action.type === "open-settings-history") {
    return state.screen === "settings" && state.view === "menu"
      ? { ...state, view: "history", focusRow: "open-history" }
      : state;
  }
  if (action.type === "open-settings-data-transfer") {
    return state.screen === "settings" && state.view === "menu"
      ? { ...state, view: "data-transfer", focusRow: "open-data-transfer" }
      : state;
  }
  if (action.type === "return-to-settings") {
    return state.screen === "settings" && state.view !== "menu"
      ? { ...state, view: "menu" }
      : state;
  }
  if (action.type === "close-settings") {
    return state.screen === "settings" && state.view === "menu" ? state.returnState : state;
  }
  if (action.type === "open-library") return { screen: "library", length: action.length, selected: null };
  if (action.type === "open-games") return { screen: "games", selected: null };
  if (action.type === "open-challenge") return { screen: "challenge" };
  if (action.type === "open-venice") return { screen: "venice" };
  if (action.type === "start") {
    return startActivity(action.activity, action.seed, action.lineSessionLength ?? defaultLinePracticeSessionLength);
  }
  if (action.type === "start-passage") return startPassage(action.activity);

  if (state.screen === "menu") return state;
  if (state.screen === "games") {
    return action.type === "return-to-menu" ? { screen: "menu", selected: gamesEntry.id } : state;
  }
  if (state.screen === "library") {
    return action.type === "return-to-menu"
      ? { screen: "menu", selected: state.length === "short" ? shortPassageEntry.id : longPassageEntry.id }
      : state;
  }
  if (state.screen === "settings") return state;
  if (state.screen === "challenge") {
    return action.type === "return-to-menu" ? { screen: "games", selected: challengeEntry.id } : state;
  }
  if (state.screen === "venice") {
    return action.type === "return-to-menu" ? { screen: "games", selected: veniceEntry.id } : state;
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
    if (action.type === "retry-randomized") {
      if (state.activity.kind !== "passage") {
        return startActivity(state.activity, action.seed, state.lineSessionLength ?? defaultLinePracticeSessionLength);
      }
      return state;
    }
    if (action.type === "retry") {
      return state.activity.kind === "passage" ? startPassage(state.activity) : state;
    }
    return state;
  }
  if (state.screen === "practice") return reduceTextPractice(state, action);
  if (state.screen === "passage") return reducePassagePractice(state, action);
  return state;
}

type SessionState = {
  screen: PracticeState;
  pending: readonly PracticeRecord[];
  pendingSessions: readonly PracticeSessionRecord[];
  latest: PracticeRecord | null;
};

type SessionAction = AppAction | { type: "saved"; id: string } | { type: "saved-session"; id: string };

function completedRecord(before: PracticeState, after: PracticeState, action: AppAction): PracticeRecord | null {
  if (action.type !== "submit" || (before.screen !== "practice" && before.screen !== "passage")) return null;
  const score = after.screen === "result"
    ? before.screen === "practice" && after.sessionRecord
      ? after.sessionRecord.lineScores.at(-1) ?? after.score
      : after.score
    : before.screen === "practice" && after.screen === "practice" && after.round > before.round
      ? after.previous : null;
  if (!score) return null;
  const mode = before.screen === "passage" ? before.activity.length : before.activity.kind;
  return {
    id: action.id,
    materialId: before.screen === "practice" ? before.lesson.id : before.activity.id,
    completedAt: action.completedAt,
    mode,
    language: before.screen === "practice" ? before.lesson.language : before.activity.language,
    score,
  };
}

function reduceSessions(state: SessionState, action: SessionAction): SessionState {
  if (action.type === "saved") {
    return { ...state, pending: state.pending.filter((record) => record.id !== action.id) };
  }
  if (action.type === "saved-session") {
    return { ...state, pendingSessions: state.pendingSessions.filter((record) => record.id !== action.id) };
  }
  const screen = reducePracticeState(state.screen, action);
  const record = completedRecord(state.screen, screen, action);
  let savedSession = screen.screen === "result" ? screen.sessionRecord : null;
  if (action.type === "return-to-menu" && action.sessionId && action.completedAt !== undefined) {
    if (state.screen.screen === "practice") {
      const scores = state.screen.completedLineScores;
      savedSession = sessionRecord(
        action.sessionId,
        action.completedAt,
        "line",
        state.screen.lesson.language,
        state.screen.activity.lessons.slice(0, scores.length).map((lesson) => lesson.id),
        state.screen.lineSessionLength,
        scores,
        "early-exit",
      );
    } else if (state.screen.screen === "passage") {
      savedSession = sessionRecord(
        action.sessionId,
        action.completedAt,
        state.screen.activity.length,
        state.screen.activity.language,
        [state.screen.activity.id],
        null,
        state.screen.session.lineScores,
        "early-exit",
      );
    }
  }
  return {
    ...state,
    screen,
    pending: record ? [...state.pending, record] : state.pending,
    pendingSessions: savedSession ? [...state.pendingSessions, savedSession] : state.pendingSessions,
    latest: record ?? state.latest,
  };
}

export function usePracticeState() {
  const [state, dispatch] = useReducer(reduceSessions, {
    screen: { screen: "menu", selected: null },
    pending: [],
    pendingSessions: [],
    latest: null,
  });
  const acknowledge = useCallback((id: string) => dispatch({ type: "saved", id }), []);
  const acknowledgeSession = useCallback((id: string) => dispatch({ type: "saved-session", id }), []);
  return {
    state: state.screen,
    pending: state.pending[0],
    pendingSession: state.pendingSessions[0],
    latest: state.latest,
    dispatch,
    acknowledge,
    acknowledgeSession,
  };
}

export function completionTime(at: number): CompletionTime {
  return { id: crypto.randomUUID(), sessionId: crypto.randomUUID(), completedAt: Date.now(), at };
}
