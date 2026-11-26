import type { Language } from "../content/lessons";

export type PracticeSession = {
  input: string;
  startedAt: number | null;
  completedAt: number | null;
  excludedDurationMs: number;
  pausedAt: number | null;
  pauseReasons: readonly PracticePauseReason[];
};

export type PracticePauseReason = "settings" | "app-inactive";

export type TypingScore = {
  accuracy: number | null;
  correctCount: number;
  typedCount: number;
  elapsedMs: number | null;
  charactersPerMinute: number | null;
  keystrokeCount: number | null;
  keystrokesPerMinute: number | null;
};

export type PracticeAction =
  | { type: "input-changed"; input: string; at: number }
  | { type: "submitted"; at: number };

const koreanCharacterSegmenter = new Intl.Segmenter("ko", {
  granularity: "grapheme",
});

// Two-set input uses two physical keys for compound vowels and final clusters; shifted doubles stay one.
const compoundMedials = new Set([0x116a, 0x116b, 0x116c, 0x116f, 0x1170, 0x1171, 0x1174]);
const compoundFinals = new Set([0x11aa, 0x11ac, 0x11ad, 0x11b0, 0x11b1, 0x11b2, 0x11b3, 0x11b4, 0x11b5, 0x11b6, 0x11b9]);
const compoundCompatibilityConsonants = new Set([0x3133, 0x3135, 0x3136, 0x313a, 0x313b, 0x313c, 0x313d, 0x313e, 0x313f, 0x3140, 0x3144]);
const compoundCompatibilityVowels = new Set([0x3158, 0x3159, 0x315a, 0x315d, 0x315e, 0x315f, 0x3162]);

export function normalizeInput(input: string): string {
  return input.normalize("NFC");
}

export function splitCharacters(input: string): string[] {
  return Array.from(koreanCharacterSegmenter.segment(normalizeInput(input)), (part) =>
    part.segment
  );
}

function isModernKoreanJamo(codePoint: number): boolean {
  return (codePoint >= 0x1100 && codePoint <= 0x1112)
    || (codePoint >= 0x1161 && codePoint <= 0x1175)
    || (codePoint >= 0x11a8 && codePoint <= 0x11c2)
    || (codePoint >= 0x3131 && codePoint <= 0x3163);
}

function jamoKeystrokes(codePoint: number): number {
  return compoundMedials.has(codePoint) || compoundFinals.has(codePoint)
    || compoundCompatibilityConsonants.has(codePoint) || compoundCompatibilityVowels.has(codePoint)
    ? 2
    : 1;
}

export function countKoreanKeystrokes(input: string): number {
  return splitCharacters(input).reduce((total, character) => {
    const jamo = Array.from(character.normalize("NFD"), (part) => part.codePointAt(0)!);
    // NFD exposes the keys used for a Hangul syllable; non-jamo graphemes remain one key.
    if (jamo.length === 0 || !jamo.every(isModernKoreanJamo)) return total + 1;
    return total + jamo.reduce((count, codePoint) => count + jamoKeystrokes(codePoint), 0);
  }, 0);
}

export function createPracticeSession(): PracticeSession {
  return {
    input: "",
    startedAt: null,
    completedAt: null,
    excludedDurationMs: 0,
    pausedAt: null,
    pauseReasons: [],
  };
}

/** Adds or removes a timing pause without counting overlapping reasons twice. */
export function setPracticeSessionPause(
  session: PracticeSession,
  reason: PracticePauseReason,
  paused: boolean,
  at: number,
): PracticeSession {
  if (session.startedAt === null || session.completedAt !== null || !Number.isFinite(at)) {
    return session;
  }

  const alreadyPausedForReason = session.pauseReasons.includes(reason);
  if (paused === alreadyPausedForReason) return session;

  const safeAt = Math.max(session.startedAt, session.pausedAt ?? session.startedAt, at);
  if (paused) {
    return {
      ...session,
      pausedAt: session.pausedAt ?? safeAt,
      pauseReasons: [...session.pauseReasons, reason],
    };
  }

  const pauseReasons = session.pauseReasons.filter((activeReason) => activeReason !== reason);
  const resumed = pauseReasons.length === 0;
  return {
    ...session,
    excludedDurationMs: session.excludedDurationMs + (
      resumed && session.pausedAt !== null ? Math.max(0, safeAt - session.pausedAt) : 0
    ),
    pausedAt: resumed ? null : session.pausedAt,
    pauseReasons,
  };
}

export function reducePracticeSession(
  session: PracticeSession,
  action: PracticeAction,
): PracticeSession {
  if (session.completedAt !== null) {
    return session;
  }

  if (action.type === "submitted") {
    return {
      ...session,
      completedAt: action.at,
    };
  }

  const input = normalizeInput(action.input);

  return {
    ...session,
    input,
    startedAt: session.startedAt ?? (input.length > 0 ? action.at : null),
  };
}

export function calculateTypingScore(
  target: string,
  session: PracticeSession,
  now: number,
  language: Language,
): TypingScore {
  const targetCharacters = splitCharacters(target);
  const typedCharacters = splitCharacters(session.input);
  const correctCount = typedCharacters.reduce(
    (count, character, index) =>
      character === targetCharacters[index] ? count + 1 : count,
    0,
  );
  const typedCount = typedCharacters.length;
  const completedAt = session.completedAt ?? now;
  const activePauseMs = session.pausedAt === null
    ? 0
    : Math.max(0, completedAt - session.pausedAt);
  const elapsedMs =
    session.startedAt === null
      ? null
      : Math.max(0, completedAt - session.startedAt - session.excludedDurationMs - activePauseMs);
  const keystrokeCount = language === "ko" ? countKoreanKeystrokes(session.input) : null;
  return createTypingScore(correctCount, typedCount, elapsedMs, language, keystrokeCount);
}

export function createTypingScore(
  correctCount: number,
  typedCount: number,
  elapsedMs: number | null,
  language: Language,
  keystrokeCount: number | null,
): TypingScore {
  const accuracy =
    typedCount === 0 ? null : (correctCount * 100) / typedCount;
  const ratePerMinute = (count: number | null) =>
    count === null || count === 0 || elapsedMs === null || elapsedMs < 1_000
      ? null
      : (count * 60_000) / elapsedMs;

  return {
    accuracy,
    correctCount,
    typedCount,
    elapsedMs,
    charactersPerMinute: language === "en" ? ratePerMinute(correctCount) : null,
    keystrokeCount: language === "ko" ? keystrokeCount : null,
    keystrokesPerMinute: language === "ko" ? ratePerMinute(keystrokeCount) : null,
  };
}

export function aggregateTypingScores(
  scores: readonly TypingScore[],
  language: Language,
): TypingScore {
  const correctCount = scores.reduce((total, score) => total + score.correctCount, 0);
  const typedCount = scores.reduce((total, score) => total + score.typedCount, 0);
  const elapsedMs = scores.some((score) => score.elapsedMs !== null)
    ? scores.reduce((total, score) => total + (score.elapsedMs ?? 0), 0)
    : null;
  const keystrokeCount = language === "ko"
    ? scores.reduce((total, score) => total + (score.keystrokeCount ?? 0), 0)
    : null;
  return createTypingScore(correctCount, typedCount, elapsedMs, language, keystrokeCount);
}

export function hasReachedEnd(target: string, input: string): boolean {
  return splitCharacters(input).length >= splitCharacters(target).length;
}

/**
 * Accuracy of the current input without speed. Speed is only reported when an
 * item is submitted, so in-progress screens show accuracy alone.
 */
export function calculateLiveAccuracy(target: string, input: string, language: Language): TypingScore {
  const targetCharacters = splitCharacters(target);
  const typedCharacters = splitCharacters(input);
  const correctCount = typedCharacters.reduce(
    (count, character, index) => character === targetCharacters[index] ? count + 1 : count,
    0,
  );
  return createTypingScore(correctCount, typedCharacters.length, null, language, null);
}

export function insertSpaceAtSelection(
  input: string,
  selectionStart: number,
  selectionEnd: number,
): { input: string; caret: number } {
  const start = Math.max(0, Math.min(input.length, selectionStart));
  const end = Math.max(start, Math.min(input.length, selectionEnd));
  const nextInput = `${input.slice(0, start)} ${input.slice(end)}`;
  return { input: nextInput, caret: start + 1 };
}
