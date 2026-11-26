import { describe, expect, it } from "vitest";
import type { PracticeHighScore, PracticeSessionRecord } from "./history";
import type { TypingScore } from "./typing";
import { decidePracticeHighScore, highScoreScopeKey, mannWhitneyGreater, sessionAccuracy } from "./sessionHighScore";

function lineScore(rate: number | null, accuracy = 100): TypingScore {
  const correctCount = accuracy;
  return {
    accuracy,
    correctCount,
    typedCount: 100,
    elapsedMs: 60_000,
    charactersPerMinute: null,
    keystrokeCount: 100,
    keystrokesPerMinute: rate,
  };
}

function session(
  id: string,
  rates: readonly (number | null)[],
  options: Partial<Pick<PracticeSessionRecord, "completion" | "lineSessionLength" | "mode">> = {},
  accuracy = 100,
): PracticeSessionRecord {
  const mode = options.mode ?? "line";
  return {
    id,
    completedAt: 1,
    mode,
    language: "ko",
    materialIds: rates.map((_, index) => `lesson-${index}`),
    lineSessionLength: options.lineSessionLength === undefined ? (mode === "line" ? rates.length as 5 | 10 | 20 | 30 | 50 | 75 | 100 : null) : options.lineSessionLength,
    completion: options.completion ?? "completed",
    lineScores: rates.map((rate) => lineScore(rate, accuracy)),
  };
}

function firstScore(rates: readonly number[]): PracticeHighScore {
  const result = decidePracticeHighScore(session("first", rates), undefined);
  if (!result.next) throw new Error("Expected a first high score.");
  return result.next;
}

describe("one-sided Mann–Whitney randomization", () => {
  it("uses the faster sample as the alternative and matches a small exact reference", () => {
    expect(mannWhitneyGreater([3, 4], [1, 2])).toEqual({
      uStatistic: 4,
      pValue: 1 / 6,
      method: "exact",
    });
    expect(mannWhitneyGreater([1, 2], [3, 4]).pValue).toBe(1);
  });

  it("uses average-rank ties and returns p=1 when every value is identical", () => {
    expect(mannWhitneyGreater([2, 2], [1, 2])).toMatchObject({
      uStatistic: 3,
      pValue: 1 / 2,
      method: "exact",
    });
    expect(mannWhitneyGreater([5, 5, 5], [5, 5, 5])).toMatchObject({
      uStatistic: 4.5,
      pValue: 1,
      method: "exact",
    });
  });

  it("keeps the strict p < 0.05 boundary and uses the corrected approximation for large samples", () => {
    const boundary = mannWhitneyGreater([4, 5, 6], [1, 2, 3]);
    expect(boundary.pValue).toBe(0.05);
    const large = mannWhitneyGreater(
      Array.from({ length: 20 }, (_, index) => index + 101),
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
    expect(large.method).toBe("normal-approximation");
    expect(large.pValue).toBeLessThan(0.05);
    const negative = mannWhitneyGreater(
      Array.from({ length: 20 }, (_, index) => index + 1),
      Array.from({ length: 20 }, (_, index) => index + 101),
    );
    expect(negative.method).toBe("normal-approximation");
    expect(negative.pValue).toBeGreaterThan(0.5);
    expect(mannWhitneyGreater([3, 4], [1, 2, 3]).method).toBe("exact");
  });

  it("returns p=0.5 for a zero continuity-corrected z score", () => {
    const baseline = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109];
    const current = [100.5, 101, 102, 103, 104, 105, 106, 107, 108, 109];

    expect(mannWhitneyGreater(current, baseline)).toEqual({
      uStatistic: 50.5,
      pValue: 0.5,
      method: "normal-approximation",
    });
  });
});

describe("practice session high-score policy", () => {
  it("keeps passage scopes language-specific and uses raw English CPM samples", () => {
    expect(highScoreScopeKey("short", "ko", null)).toBe("short:ko");
    expect(highScoreScopeKey("long", "en", null)).toBe("long:en");

    const englishSession: PracticeSessionRecord = {
      ...session("english-short", [120, 121, 122, 123, 124], { mode: "short" }),
      language: "en",
      materialIds: ["passage-short"],
      lineScores: [120, 121, 122, 123, 124].map((rate) => ({
        ...lineScore(null),
        charactersPerMinute: rate,
        keystrokeCount: null,
        keystrokesPerMinute: null,
      })),
    };
    const decision = decidePracticeHighScore(englishSession, undefined);
    expect(decision.decision).toMatchObject({ status: "first-record", median: 122 });
    expect(decision.next?.scopeKey).toBe("short:en");
  });

  it("uses the first eligible session, then requires accuracy, sample count, 0.3%, and significance", () => {
    const previous = firstScore([100, 100, 100, 100, 100]);
    expect(previous.scopeKey).toBe(highScoreScopeKey("line", "ko", 5));

    const belowThreeTenthsPercent = decidePracticeHighScore(
      session("below", [100.2, 100.2, 100.2, 100.2, 100.2]),
      previous,
    );
    expect(belowThreeTenthsPercent.decision).toMatchObject({ status: "kept", reason: "below-improvement" });
    expect(belowThreeTenthsPercent.next).toBe(previous);

    const exactThreshold = decidePracticeHighScore(
      session("threshold", [100.3, 100.3, 100.3, 100.3, 100.3]),
      previous,
    );
    expect(exactThreshold.decision.status).toBe("new-record");

    const notSignificant = decidePracticeHighScore(
      session("noisy", [100, 100, 103, 103, 103]),
      previous,
    );
    expect(notSignificant.decision).toMatchObject({ status: "kept", reason: "not-significant" });
    expect(notSignificant.next).toBe(previous);

    expect(decidePracticeHighScore(session("low-accuracy", [120, 120, 120, 120, 120], {}, 96), previous).decision)
      .toEqual({ status: "ineligible", reason: "accuracy" });
    expect(decidePracticeHighScore(session("accuracy-boundary", [120, 120, 120, 120, 120], {}, 97), undefined).decision.status)
      .toBe("first-record");
    expect(decidePracticeHighScore(session("few", [120, 120, 120, 120], { mode: "short" }), undefined).decision)
      .toEqual({ status: "ineligible", reason: "samples" });
    expect(decidePracticeHighScore(session("missing", [120, 120, 120, 120, null]), undefined).decision)
      .toEqual({ status: "ineligible", reason: "samples" });
    expect(decidePracticeHighScore(session("early", [120, 120, 120, 120, 120], { completion: "early-exit" }), previous).decision)
      .toEqual({ status: "ineligible", reason: "early-exit" });
  });

  it("aggregates accuracy by typed character counts and keeps very large finite samples stable", () => {
    const weighted: PracticeSessionRecord = {
      ...session("weighted", [100, null]),
      lineScores: [
        { ...lineScore(100), accuracy: 0, correctCount: 0, typedCount: 1 },
        { ...lineScore(null), accuracy: 100, correctCount: 999, typedCount: 999 },
      ],
    };
    expect(sessionAccuracy(weighted)).toBe(99.9);

    const extreme = session("extreme", Array(6).fill(Number.MAX_VALUE), { mode: "short" });
    const score = decidePracticeHighScore(extreme, undefined);
    expect(score.decision).toMatchObject({ status: "first-record", median: Number.MAX_VALUE });
  });
});
