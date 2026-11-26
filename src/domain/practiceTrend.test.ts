import { describe, expect, it } from "vitest";
import type { PracticeSessionRecord } from "./history";
import type { TypingScore } from "./typing";
import {
  buildPracticeTrend,
  trendDisplaySessionCount,
  trendMinimumComparableSessions,
  trendRecentAverageCount,
} from "./practiceTrend";

function lineScore(rate: number | null): TypingScore {
  return {
    accuracy: 100,
    correctCount: 100,
    typedCount: 100,
    elapsedMs: 60_000,
    charactersPerMinute: rate,
    keystrokeCount: 100,
    keystrokesPerMinute: rate,
  };
}

function session(
  id: string,
  rates: readonly (number | null)[],
  options: Partial<Pick<PracticeSessionRecord, "completion" | "lineSessionLength" | "mode" | "language" | "completedAt">> = {},
): PracticeSessionRecord {
  const mode = options.mode ?? "line";
  return {
    id,
    completedAt: options.completedAt ?? 1,
    mode,
    language: options.language ?? "ko",
    materialIds: ["material"],
    lineSessionLength: options.lineSessionLength === undefined
      ? (mode === "line" ? rates.length as 5 | 10 | 20 | 30 | 50 | 75 | 100 : null)
      : options.lineSessionLength,
    completion: options.completion ?? "completed",
    lineScores: rates.map(lineScore),
  };
}

describe("practice speed trend", () => {
  it("groups comparable sessions by mode, language, and one-line session length", () => {
    const sessions = [
      session("line-5", [100, 100, 100], { lineSessionLength: 5, completedAt: 1 }),
      session("line-10", [200, 200, 200], { lineSessionLength: 10, completedAt: 2 }),
      session("short-ko", [300, 300, 300], { mode: "short", completedAt: 3 }),
      session("short-en", [50, 50, 50], { mode: "short", language: "en", completedAt: 4 }),
    ];

    const groups = buildPracticeTrend(sessions);

    expect(groups.map((group) => group.key)).toEqual([
      "short:en",
      "short:ko",
      "line:ko:10",
      "line:ko:5",
    ]);
    expect(groups.map((group) => group.sessionCount)).toEqual([1, 1, 1, 1]);
    expect(groups[3]?.lineSessionLength).toBe(5);
    expect(groups.every((group) => group.minimumSessions === trendMinimumComparableSessions)).toBe(true);
  });

  it("keeps only completed sessions with a usable speed sample", () => {
    const groups = buildPracticeTrend([
      session("early", [100, 100, 100], { completion: "early-exit" }),
      session("no-rate", [null, null, null]),
      session("zero-rate", [0, 0, 0]),
      session("valid", [100, 100, 100]),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.points.map((point) => point.sessionId)).toEqual(["valid"]);
  });

  it("orders points chronologically and averages only the most recent sessions", () => {
    const rates = Array.from({ length: trendRecentAverageCount + 2 }, (_, index) => 100 + index * 10);
    const sessions = rates.map((rate, index) => session(`session-${index}`, [rate, rate, rate], {
      completedAt: index,
    }));

    const group = buildPracticeTrend([...sessions].reverse())[0]!;

    expect(group.points.map((point) => point.sessionId)).toEqual(sessions.map((entry) => entry.id));
    expect(group.recentAverage).toBe(rates.slice(-trendRecentAverageCount).reduce((sum, rate) => sum + rate, 0) / trendRecentAverageCount);
  });

  it("limits the displayed points but keeps the full comparable session count", () => {
    const sessions = Array.from({ length: trendDisplaySessionCount + 4 }, (_, index) => session(`session-${index}`, [100, 100, 100], {
      completedAt: index,
    }));

    const group = buildPracticeTrend(sessions)[0]!;

    expect(group.points).toHaveLength(trendDisplaySessionCount);
    expect(group.points[0]?.sessionId).toBe("session-4");
    expect(group.sessionCount).toBe(trendDisplaySessionCount + 4);
  });
});
