import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeVeniceRecords, readVeniceRecords, saveVeniceRun, veniceStorageKey } from "./veniceStorage";
import type { VeniceRun } from "../domain/venice";

function makeRun(id: string, score: number, completedAt: number): VeniceRun {
  return {
    id,
    rulesVersion: 1,
    startedAt: completedAt - 1_000,
    completedAt,
    startLevel: 1,
    highestLevel: 1,
    score,
    typedWords: 1,
    missedWords: 0,
    durationMs: 1_000,
    levelStats: [{ level: 1, spawned: 1, typedCorrectly: 1, missed: 0, durationMs: 1_000 }],
  };
}

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)); },
    removeItem: (key) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } as Storage;
}

function serialLocks(): LockManager {
  const tails = new Map<string, Promise<void>>();
  return {
    request: async (name, _options, callback) => {
      const previous = tails.get(name) ?? Promise.resolve();
      let release = () => {};
      const next = new Promise<void>((resolve) => { release = resolve; });
      tails.set(name, next);
      await previous;
      try {
        return await callback(null);
      } finally {
        release();
      }
    },
  } as LockManager;
}

describe("Venice storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
    vi.stubGlobal("navigator", { locks: serialLocks() });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("starts with empty local lists and rejects malformed or incompatible schemas", () => {
    expect(decodeVeniceRecords(null)).toEqual({ ok: true, records: { recentRuns: [], topScores: [] } });
    expect(decodeVeniceRecords("not json")).toEqual({ ok: false, records: null });
    expect(decodeVeniceRecords(JSON.stringify({ version: 2, recentRuns: [], topScores: [] })))
      .toEqual({ ok: false, records: null });
  });

  it("saves runs idempotently and retains recent runs separately from the Top 10", async () => {
    for (let index = 1; index <= 12; index += 1) {
      const run = makeRun("run-" + index, index * 100, 10_000 + index);
      expect((await saveVeniceRun(run)).ok).toBe(true);
    }
    await saveVeniceRun(makeRun("run-12", 1_200, 10_012));

    const saved = readVeniceRecords();
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    expect(saved.records.recentRuns).toHaveLength(12);
    expect(saved.records.topScores).toHaveLength(10);
    expect(saved.records.topScores[0]?.id).toBe("run-12");
    expect(saved.records.topScores.at(-1)?.id).toBe("run-3");
  });

  it("serializes concurrent tab writes and merges both unique runs", async () => {
    const result = await Promise.all([
      saveVeniceRun(makeRun("first", 100, 10_100)),
      saveVeniceRun(makeRun("second", 200, 10_200)),
    ]);
    expect(result.every((item) => item.ok)).toBe(true);
    const saved = readVeniceRecords();
    expect(saved.ok && saved.records.recentRuns.map((run) => run.id).sort()).toEqual(["first", "second"]);
  });

  it("does not overwrite corrupt saved data or include unplayed sessions", async () => {
    localStorage.setItem(veniceStorageKey, "{broken");
    const failed = await saveVeniceRun(makeRun("played", 100, 10_100));
    expect(failed).toEqual({ ok: false, records: null });
    expect(localStorage.getItem(veniceStorageKey)).toBe("{broken");

    localStorage.removeItem(veniceStorageKey);
    const unplayed = makeRun("cancelled", 0, 10_100);
    const empty = await saveVeniceRun({ ...unplayed, typedWords: 0, missedWords: 0 });
    expect(empty).toMatchObject({ ok: true, records: { recentRuns: [], topScores: [] } });
  });

  it("rejects an invalid run before changing storage", async () => {
    const invalid = { ...makeRun("invalid", 100, 10_100), highestLevel: 15 } as VeniceRun;
    const failed = await saveVeniceRun(invalid);
    expect(failed).toEqual({ ok: false, records: null });
    expect(localStorage.getItem(veniceStorageKey)).toBeNull();
  });
});
