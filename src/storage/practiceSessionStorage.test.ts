import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PracticeSessionRecord } from "../domain/history";
import type { TypingScore } from "../domain/typing";
import { clearHighScores, historyKey, readHistory, savePracticeSession } from "./historyStorage";

let failNextHistoryWrite = false;

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === historyKey && failNextHistoryWrite) {
        failNextHistoryWrite = false;
        throw new Error("quota exceeded");
      }
      values.set(key, String(value));
    },
    removeItem: (key) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } as Storage;
}

function locks(): LockManager {
  const tails = new Map<string, Promise<void>>();
  return {
    request: async (name, optionsOrCallback, callback) => {
      const previous = tails.get(name) ?? Promise.resolve();
      let release = () => {};
      const next = new Promise<void>((resolve) => { release = resolve; });
      tails.set(name, next);
      await previous;
      try {
        const operation = typeof optionsOrCallback === "function" ? optionsOrCallback : callback;
        if (!operation) throw new Error("Missing lock callback.");
        return await operation(null);
      } finally {
        release();
      }
    },
  } as LockManager;
}

function score(rate: number): TypingScore {
  return {
    accuracy: 100,
    correctCount: 100,
    typedCount: 100,
    elapsedMs: 60_000,
    charactersPerMinute: null,
    keystrokeCount: 100,
    keystrokesPerMinute: rate,
  };
}

function session(id: string, rates: readonly number[]): PracticeSessionRecord {
  return {
    id,
    completedAt: Number(id.replace(/\D/g, "")) || 10,
    mode: "line",
    language: "ko",
    materialIds: rates.map((_, index) => `lesson-${index}`),
    lineSessionLength: 5,
    completion: "completed",
    lineScores: rates.map(score),
  };
}

describe("practice session storage", () => {
  beforeEach(() => {
    failNextHistoryWrite = false;
    vi.stubGlobal("localStorage", memoryStorage());
    vi.stubGlobal("navigator", { locks: locks() });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("migrates old history without deriving session records from individual rows", () => {
    localStorage.setItem(historyKey, JSON.stringify({ version: 3, records: [] }));
    expect(readHistory()).toEqual({ ok: true, records: [], sessions: [], highScores: [] });
  });

  it("saves the session and initial high score together and ignores duplicate completion", async () => {
    const first = session("session-10", [100, 100, 100, 100, 100]);
    const saved = await savePracticeSession(first);
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    expect(saved.decision).toEqual({ status: "first-record", median: 100 });
    expect(saved.history.sessions).toEqual([first]);
    expect(saved.history.highScores).toHaveLength(1);

    const duplicate = await savePracticeSession(first);
    expect(duplicate.ok && duplicate.duplicate).toBe(true);
    expect(readHistory().ok && readHistory().sessions).toHaveLength(1);
  });

  it("updates only after both median and significance rules pass, preserving the prior winner otherwise", async () => {
    await savePracticeSession(session("session-10", [100, 100, 100, 100, 100]));
    const belowThreshold = await savePracticeSession(session("session-11", [100.2, 100.2, 100.2, 100.2, 100.2]));
    expect(belowThreshold.ok && belowThreshold.decision).toMatchObject({ status: "kept", reason: "below-improvement" });
    const prior = readHistory();
    if (!prior.ok) throw new Error("Expected readable history");
    expect(prior.highScores[0]?.sessionId).toBe("session-10");

    const update = await savePracticeSession(session("session-12", [100.3, 100.3, 100.3, 100.3, 100.3]));
    expect(update.ok && update.decision.status).toBe("new-record");
    const saved = readHistory();
    if (!saved.ok) throw new Error("Expected readable history");
    expect(saved.sessions).toHaveLength(3);
    expect(saved.highScores[0]?.sessionId).toBe("session-12");
  });

  it("leaves stored sessions and high scores unchanged on write failure and supports resetting highscores alone", async () => {
    await savePracticeSession(session("session-10", [100, 100, 100, 100, 100]));
    const before = localStorage.getItem(historyKey);
    failNextHistoryWrite = true;
    expect(await savePracticeSession(session("session-12", [103, 103, 103, 103, 103]))).toMatchObject({ ok: false });
    expect(localStorage.getItem(historyKey)).toBe(before);

    expect(await clearHighScores()).toBe(true);
    const cleared = readHistory();
    if (!cleared.ok) throw new Error("Expected readable history");
    expect(cleared.sessions).toHaveLength(1);
    expect(cleared.highScores).toEqual([]);
  });
});
