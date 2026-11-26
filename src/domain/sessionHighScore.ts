import type { Language } from "../content/lessons";
import type { PracticeHighScore, PracticeSessionRecord } from "./history";
import type { TypingScore } from "./typing";
import { summarizeTypingRates } from "./typingStatistics";

export const highScoreRulesVersion = 1;
export const highScoreMinimumAccuracy = 97;
export const highScoreMinimumSamples = 5;
export const highScoreMinimumImprovement = 0.003;
export const highScoreSignificanceLevel = 0.05;
const maxExactAssignments = 100_000;

export type MannWhitneyResult = Readonly<{
  uStatistic: number;
  pValue: number;
  method: "exact" | "normal-approximation";
}>;

export type HighScoreDecision =
  | Readonly<{ status: "ineligible"; reason: "early-exit" | "accuracy" | "samples" | "invalid-rate" }>
  | Readonly<{ status: "first-record"; median: number }>
  | Readonly<{ status: "new-record"; median: number; previousMedian: number; improvement: number; pValue: number }>
  | Readonly<{
      status: "kept";
      reason: "below-improvement" | "not-significant" | "below-improvement-and-not-significant";
      median: number;
      previousMedian: number;
      improvement: number;
      pValue: number;
    }>
  | Readonly<{ status: "already-saved" }>;

export type SessionStatistics = ReturnType<typeof summarizeTypingRates>;

export function speedSample(score: TypingScore, language: Language): number | null {
  const value = language === "ko" ? score.keystrokesPerMinute : score.charactersPerMinute;
  return value !== null && Number.isFinite(value) && value > 0 ? value : null;
}

export function sessionSpeedSamples(session: PracticeSessionRecord): number[] {
  return session.lineScores.flatMap((score) => {
    const sample = speedSample(score, session.language);
    return sample === null ? [] : [sample];
  });
}

export function sessionAccuracy(session: PracticeSessionRecord): number | null {
  const correctCount = session.lineScores.reduce((sum, score) => sum + score.correctCount, 0);
  const typedCount = session.lineScores.reduce((sum, score) => sum + score.typedCount, 0);
  return typedCount > 0 ? (correctCount * 100) / typedCount : null;
}

export function sessionStatistics(session: PracticeSessionRecord): SessionStatistics {
  return summarizeTypingRates(sessionSpeedSamples(session), session.lineScores.length);
}

export function highScoreScopeKey(
  mode: PracticeSessionRecord["mode"],
  language: Language,
  lineSessionLength: PracticeSessionRecord["lineSessionLength"],
): string {
  return mode === "line"
    ? `line:${language}:${lineSessionLength ?? "invalid"}`
    : `${mode}:${language}`;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] ?? 0) / 2 + (sorted[middle] ?? 0) / 2
    : sorted[middle] ?? Number.NaN;
}

function countAssignments(total: number, chosen: number): number {
  let result = 1;
  const count = Math.min(chosen, total - chosen);
  for (let index = 1; index <= count; index += 1) {
    result = result * (total - count + index) / index;
    if (result > maxExactAssignments) return result;
  }
  return result;
}

function uStatistic(left: readonly number[], right: readonly number[]): number {
  let value = 0;
  for (const candidate of left) {
    for (const comparison of right) {
      if (candidate > comparison) value += 1;
      else if (candidate === comparison) value += 0.5;
    }
  }
  return value;
}

function exactPermutationPValue(
  pooled: readonly number[],
  leftSize: number,
  observedU: number,
): number {
  let total = 0;
  let atLeastObserved = 0;
  const selected: number[] = [];

  function enumerate(start: number): void {
    if (selected.length === leftSize) {
      const chosen = new Set(selected);
      const left = selected.map((index) => pooled[index] ?? 0);
      const right = pooled.flatMap((value, index) => chosen.has(index) ? [] : [value]);
      if (uStatistic(left, right) + Number.EPSILON >= observedU) atLeastObserved += 1;
      total += 1;
      return;
    }
    const remaining = leftSize - selected.length;
    for (let index = start; index <= pooled.length - remaining; index += 1) {
      selected.push(index);
      enumerate(index + 1);
      selected.pop();
    }
  }

  enumerate(0);
  return total === 0 ? 1 : atLeastObserved / total;
}

function normalSurvival(value: number): number {
  if (value === 0) return 0.5;
  if (value < 0) return 1 - normalSurvival(-value);
  // Abramowitz-Stegun 7.1.26; sufficient for the product's p < .05 gate.
  const t = 1 / (1 + 0.2316419 * value);
  const density = Math.exp(-0.5 * value * value) / Math.sqrt(2 * Math.PI);
  const tail = density * t * (
    0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))
  );
  return Math.min(1, Math.max(0, tail));
}

function normalApproximationPValue(
  pooled: readonly number[],
  leftSize: number,
  rightSize: number,
  observedU: number,
): number {
  const total = pooled.length;
  const ties = new Map<number, number>();
  for (const value of pooled) ties.set(value, (ties.get(value) ?? 0) + 1);
  const tieAdjustment = Array.from(ties.values()).reduce((sum, count) => sum + count ** 3 - count, 0);
  const variance = (leftSize * rightSize / 12) * (
    total + 1 - tieAdjustment / (total * (total - 1))
  );
  if (!Number.isFinite(variance) || variance <= 0) return 1;
  const mean = (leftSize * rightSize) / 2;
  const z = (observedU - mean - 0.5) / Math.sqrt(variance);
  return normalSurvival(z);
}

/** One-sided randomization test: the first sample is expected to be faster. */
export function mannWhitneyGreater(
  faster: readonly number[],
  baseline: readonly number[],
): MannWhitneyResult {
  const left = faster.filter((value) => Number.isFinite(value) && value > 0);
  const right = baseline.filter((value) => Number.isFinite(value) && value > 0);
  const observedU = uStatistic(left, right);
  const pooled = [...left, ...right].sort((a, b) => a - b);
  const assignments = countAssignments(pooled.length, left.length);
  if (left.length === 0 || right.length === 0) {
    return { uStatistic: observedU, pValue: 1, method: "exact" };
  }
  return assignments <= maxExactAssignments
    ? {
        uStatistic: observedU,
        pValue: exactPermutationPValue(pooled, left.length, observedU),
        method: "exact",
      }
    : {
        uStatistic: observedU,
        pValue: normalApproximationPValue(pooled, left.length, right.length, observedU),
        method: "normal-approximation",
      };
}

function highScoreFromSession(session: PracticeSessionRecord, rawRates: readonly number[]): PracticeHighScore {
  return {
    rulesVersion: highScoreRulesVersion,
    scopeKey: highScoreScopeKey(session.mode, session.language, session.lineSessionLength),
    sessionId: session.id,
    completedAt: session.completedAt,
    mode: session.mode,
    language: session.language,
    lineSessionLength: session.lineSessionLength,
    rawRates: [...rawRates],
    median: median(rawRates),
  };
}

export function decidePracticeHighScore(
  session: PracticeSessionRecord,
  previous: PracticeHighScore | undefined,
): Readonly<{ decision: HighScoreDecision; next: PracticeHighScore | undefined }> {
  if (session.completion !== "completed") {
    return { decision: { status: "ineligible", reason: "early-exit" }, next: previous };
  }
  if (session.mode === "line" && session.lineSessionLength !== session.lineScores.length) {
    return { decision: { status: "ineligible", reason: "early-exit" }, next: previous };
  }
  const accuracy = sessionAccuracy(session);
  if (accuracy === null || accuracy < highScoreMinimumAccuracy) {
    return { decision: { status: "ineligible", reason: "accuracy" }, next: previous };
  }
  const rates = sessionSpeedSamples(session);
  if (rates.length < highScoreMinimumSamples) {
    return { decision: { status: "ineligible", reason: "samples" }, next: previous };
  }
  const currentMedian = median(rates);
  if (!Number.isFinite(currentMedian) || currentMedian <= 0) {
    return { decision: { status: "ineligible", reason: "invalid-rate" }, next: previous };
  }
  const next = highScoreFromSession(session, rates);
  if (!previous) return { decision: { status: "first-record", median: currentMedian }, next };
  const test = mannWhitneyGreater(rates, previous.rawRates);
  const improvement = currentMedian / previous.median - 1;
  const meetsImprovement = currentMedian >= previous.median * (1 + highScoreMinimumImprovement);
  const meetsSignificance = test.pValue < highScoreSignificanceLevel;
  if (!meetsImprovement || !meetsSignificance) {
    const reason = !meetsImprovement && !meetsSignificance
      ? "below-improvement-and-not-significant"
      : meetsImprovement
        ? "not-significant"
        : "below-improvement";
    return {
      decision: {
        status: "kept",
        reason,
        median: currentMedian,
        previousMedian: previous.median,
        improvement,
      pValue: test.pValue,
      },
      next: previous,
    };
  }
  return {
    decision: {
      status: "new-record",
      median: currentMedian,
      previousMedian: previous.median,
      improvement,
        pValue: test.pValue,
    },
    next,
  };
}
