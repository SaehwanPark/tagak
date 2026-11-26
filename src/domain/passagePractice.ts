import type { Language } from "../content/lessons";
import { passageLinesPerPage } from "./textLayout";
import { calculateLiveAccuracy, calculateTypingScore, createPracticeSession, createTypingScore, hasReachedEnd, reducePracticeSession } from "./typing";
import type { PracticeSession, TypingScore } from "./typing";

/**
 * A passage reports speed once per bundle, so the same totals live at two
 * scopes: the whole passage for the final result, and the current bundle for
 * the score shown when its last line is submitted.
 *
 * Elapsed time is accumulated per line rather than measured from the first
 * key of the passage. The pause between submitting a line and pressing the
 * first key of the next line is transition/reading time; counting it would
 * make long passages look slower than the same text typed as one-line drills.
 */
export type PassageProgress = {
  elapsedMs: number;
  correctCount: number;
  typedCount: number;
  keystrokeCount: number;
};

export type PassageSession = {
  lineIndex: number;
  line: PracticeSession;
  lineScores: readonly TypingScore[];
  passage: PassageProgress;
  bundle: PassageProgress;
  /** The most recently finished bundle, so its speed stays visible like a previous line. */
  lastBundle: TypingScore | null;
};

export type PassageAdvance =
  | { type: "waiting" }
  | { type: "next-line"; session: PassageSession; bundle: TypingScore | null }
  | { type: "completed"; score: TypingScore; bundle: TypingScore; lineScores: readonly TypingScore[] };

function createProgress(): PassageProgress {
  return { elapsedMs: 0, correctCount: 0, typedCount: 0, keystrokeCount: 0 };
}

export function createPassageSession(): PassageSession {
  return {
    lineIndex: 0,
    line: createPracticeSession(),
    lineScores: [],
    passage: createProgress(),
    bundle: createProgress(),
    lastBundle: null,
  };
}

/**
 * A bundle ends on the last line before a page boundary, and the final line
 * always closes the last (possibly partial) bundle.
 */
export function endsBundle(nextLineIndex: number, lineCount: number): boolean {
  return nextLineIndex === lineCount || nextLineIndex % passageLinesPerPage === 0;
}

export function updatePassageInput(session: PassageSession, input: string, at: number): PassageSession {
  const line = reducePracticeSession(session.line, { type: "input-changed", input, at });
  return { ...session, line };
}

function addLine(progress: PassageProgress, score: TypingScore): PassageProgress {
  return {
    elapsedMs: progress.elapsedMs + (score.elapsedMs ?? 0),
    correctCount: progress.correctCount + score.correctCount,
    typedCount: progress.typedCount + score.typedCount,
    keystrokeCount: progress.keystrokeCount + (score.keystrokeCount ?? 0),
  };
}

function progressScore(progress: PassageProgress, language: Language): TypingScore {
  return createTypingScore(
    progress.correctCount,
    progress.typedCount,
    progress.elapsedMs,
    language,
    progress.keystrokeCount,
  );
}

/**
 * Accuracy for the lines finalized so far plus the line in progress. Speed is
 * deliberately absent because a passage only reports speed when a bundle ends.
 */
export function passageAccuracy(
  target: string,
  session: PassageSession,
  language: Language,
): TypingScore {
  const line = calculateLiveAccuracy(target, session.line.input, language);
  return createTypingScore(
    session.passage.correctCount + line.correctCount,
    session.passage.typedCount + line.typedCount,
    null,
    language,
    null,
  );
}

export function submitPassageLine(
  lines: readonly string[],
  session: PassageSession,
  at: number,
  language: Language,
): PassageAdvance {
  const target = lines[session.lineIndex];
  if (!target || !hasReachedEnd(target, session.line.input)) return { type: "waiting" };

  const line = calculateTypingScore(target, session.line, at, language);
  const passage = addLine(session.passage, line);
  const bundle = addLine(session.bundle, line);
  const lineScores = [...session.lineScores, line];
  const nextIndex = session.lineIndex + 1;

  if (nextIndex === lines.length) {
    return {
      type: "completed",
      score: progressScore(passage, language),
      bundle: progressScore(bundle, language),
      lineScores,
    };
  }

  const bundleEnds = endsBundle(nextIndex, lines.length);
  const finishedBundle = bundleEnds ? progressScore(bundle, language) : null;
  return {
    type: "next-line",
    session: {
      lineIndex: nextIndex,
      line: createPracticeSession(),
      lineScores,
      passage,
      bundle: bundleEnds ? createProgress() : bundle,
      lastBundle: finishedBundle ?? session.lastBundle,
    },
    bundle: finishedBundle,
  };
}

/**
 * Whether this submission closes a bundle, so the completion sound can play
 * once per bundle rather than once per line.
 */
export function submissionEndsBundle(
  lines: readonly string[],
  session: PassageSession,
  input?: string,
): boolean {
  const target = lines[session.lineIndex];
  if (!target || !hasReachedEnd(target, input ?? session.line.input)) return false;
  return endsBundle(session.lineIndex + 1, lines.length);
}
