import { expect, it } from "vitest";
import { recentPassageMaterialId, recentRecords } from "./history";
import type { PracticeRecord, PracticeSessionRecord } from "./history";

it("deduplicates sessions and keeps the newest 100", () => {
  const records = Array.from({ length: 101 }, (_, index): PracticeRecord => ({
    id: `session-${index}`,
    materialId: "first-steps",
    completedAt: index,
    mode: "line",
    language: "ko",
    score: {
      accuracy: 100,
      correctCount: 1,
      typedCount: 1,
      elapsedMs: 1_000,
      charactersPerMinute: null,
      keystrokeCount: 1,
      keystrokesPerMinute: 60,
    },
  }));
  const ordered = recentRecords([...records, records[100]!]);
  expect(ordered).toHaveLength(100);
  expect(ordered[0]?.id).toBe("session-100");
  expect(ordered.at(-1)?.id).toBe("session-1");
});

it("finds the most recent passage for a mode and language", () => {
  const score = {
    accuracy: 100,
    correctCount: 1,
    typedCount: 1,
    elapsedMs: 1_000,
    charactersPerMinute: 60,
    keystrokeCount: null,
    keystrokesPerMinute: null,
  };
  const session = (
    id: string,
    mode: PracticeSessionRecord["mode"],
    language: PracticeSessionRecord["language"],
    materialIds: readonly string[],
    completedAt: number,
  ): PracticeSessionRecord => ({
    id,
    completedAt,
    mode,
    language,
    materialIds,
    lineSessionLength: mode === "line" ? 5 : null,
    completion: "early-exit",
    lineScores: [score],
  });
  const sessions = [
    session("older", "short", "ko", ["older-passage"], 1),
    session("newer", "short", "ko", ["newer-passage"], 3),
    session("english", "short", "en", ["english-passage"], 4),
    session("long", "long", "ko", ["long-passage"], 5),
  ];

  expect(recentPassageMaterialId(sessions, "short", "ko")).toBe("newer-passage");
  expect(recentPassageMaterialId(sessions, "long", "ko")).toBe("long-passage");
  expect(recentPassageMaterialId(sessions, "short", "en")).toBe("english-passage");
  expect(recentPassageMaterialId([], "short", "ko")).toBeNull();
});
