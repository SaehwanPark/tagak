import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDataBackup, decodeDataBackup, restoreDataBackup } from "./dataBackup";
import type { DataBackup } from "./dataBackup";
import { defaultAppPreferences } from "./appPreferences";
import { historyKey } from "./historyStorage";
import { veniceStorageKey } from "./veniceStorage";
import type { PracticeHighScore, PracticeRecord, PracticeSessionRecord } from "../domain/history";
import type { VeniceRun } from "../domain/venice";

let failNextWriteTo: string | null = null;

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === failNextWriteTo) {
        failNextWriteTo = null;
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

function serialLocks(): LockManager {
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

function makeRecord(id: string, completedAt: number, materialId = id): PracticeRecord {
  return {
    id,
    materialId,
    completedAt,
    mode: "line",
    language: "ko",
    score: {
      accuracy: 100,
      correctCount: 1,
      typedCount: 1,
      elapsedMs: 1_000,
      charactersPerMinute: 60,
      keystrokeCount: 1,
      keystrokesPerMinute: 60,
    },
  };
}

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

function readBackup(raw: string): DataBackup {
  const result = decodeDataBackup(raw);
  if (!result.ok) throw new Error("Backup fixture was invalid.");
  return result.backup;
}

type BackupEnvelopeFixture = {
  format: string;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
};

function makeEnvelope(records: readonly PracticeRecord[] = [], runs: readonly VeniceRun[] = []): BackupEnvelopeFixture {
  return {
    format: "tagak-data-backup",
    version: 1,
    exportedAt: "2026-11-22T12:00:00.000Z",
    data: {
      preferences: {
        version: 2,
        preferences: { ...defaultAppPreferences, interfaceLanguage: "en" },
      },
      textSize: { version: 1, size: "large" },
      colorTheme: { version: 1, theme: "paper" },
      practiceFonts: { version: 2, fonts: { ko: "serif", en: "gothic" } },
      history: { version: 3, records },
      venice: { version: 1, rulesVersion: 1, recentRuns: runs, topScores: runs },
    },
  };
}

function makeBackup(records: readonly PracticeRecord[] = [], runs: readonly VeniceRun[] = []): DataBackup {
  return readBackup(JSON.stringify(makeEnvelope(records, runs)));
}

describe("portable data backups", () => {
  beforeEach(() => {
    failNextWriteTo = null;
    vi.stubGlobal("localStorage", memoryStorage());
    vi.stubGlobal("navigator", { locks: serialLocks() });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("rejects corrupted and unsupported envelopes before any restore", async () => {
    localStorage.setItem(historyKey, "{broken");
    const before = localStorage.getItem(historyKey);
    expect(decodeDataBackup("not json")).toEqual({ ok: false });
    expect(decodeDataBackup(JSON.stringify({ format: "tagak-data-backup", version: 9 })))
      .toEqual({ ok: false });
    expect(localStorage.getItem(historyKey)).toBe(before);
  });

  it("normalizes old and current history schemas, de-dupes IDs, and keeps limits", () => {
    const records = Array.from({ length: 105 }, (_, index) => makeRecord(`history-${index}`, index));
    records.push(makeRecord("history-104", 500, "latest-copy"));
    const runs = Array.from({ length: 35 }, (_, index) => makeRun(`run-${index}`, index, 10_001 + index));
    const limited = makeBackup(records, runs);
    expect(limited.data.history).toHaveLength(100);
    expect(limited.data.history.find((record) => record.id === "history-104")?.materialId).toBe("latest-copy");
    expect(limited.data.venice.recentRuns).toHaveLength(30);
    expect(limited.data.venice.topScores).toHaveLength(10);

    const old = makeEnvelope();
    const data = old.data;
    data.history = {
      version: 1,
      records: [{
        id: "old-record", materialId: "old", completedAt: 1, mode: "sentence", language: "ko",
        score: { accuracy: 100, correctCount: 1, typedCount: 1, elapsedMs: 1_000, charactersPerMinute: 60 },
      }],
    };
    expect(readBackup(JSON.stringify(old)).data.history[0]?.mode).toBe("line");
    expect(readBackup(JSON.stringify(old)).data.sessions).toEqual([]);
    expect(readBackup(JSON.stringify(old)).data.highScores).toEqual([]);
  });

  it("round-trips session samples and high-score winners in a versioned backup", async () => {
    const row = makeRecord("session-row", 10).score;
    const session: PracticeSessionRecord = {
      id: "session-1",
      completedAt: 20,
      mode: "line",
      language: "ko",
      materialIds: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5"],
      lineSessionLength: 5,
      completion: "completed",
      lineScores: [row, row, row, row, row],
    };
    const highScore: PracticeHighScore = {
      rulesVersion: 1,
      scopeKey: "line:ko:5",
      sessionId: session.id,
      completedAt: session.completedAt,
      mode: "line",
      language: "ko",
      lineSessionLength: 5,
      rawRates: [60, 60, 60, 60, 60],
      median: 60,
    };
    const envelope = makeEnvelope();
    envelope.data.history = {
      version: 4,
      records: [],
      sessions: [session],
      highScores: [highScore],
    };
    const backup = readBackup(JSON.stringify(envelope));
    expect(backup.data.sessions).toEqual([session]);
    expect(backup.data.highScores).toEqual([highScore]);

    expect(await restoreDataBackup(backup, "replace")).toEqual({ ok: true });
    const restored = JSON.parse(localStorage.getItem(historyKey) ?? "null");
    expect(restored).toMatchObject({ version: 4, sessions: [session], highScores: [highScore] });
  });

  it("exports and restores the configured line session length", async () => {
    localStorage.setItem("tagak:preferences", JSON.stringify({
      version: 3,
      preferences: { ...defaultAppPreferences, linePracticeSessionLength: 75 },
    }));

    const raw = createDataBackup();
    expect(raw).not.toBeNull();
    const backup = readBackup(raw!);
    expect(backup.data.preferences.linePracticeSessionLength).toBe(75);
    expect(JSON.parse(raw!).data.preferences.version).toBe(3);

    expect(await restoreDataBackup(backup, "replace")).toEqual({ ok: true });
    const restored = JSON.parse(localStorage.getItem("tagak:preferences") ?? "null");
    expect(restored).toMatchObject({ version: 3, preferences: { linePracticeSessionLength: 75 } });
  });

  it("merges unique records without replacing current preferences and repeated imports are idempotent", async () => {
    const currentRecord = makeRecord("same-id", 20, "current");
    localStorage.setItem("tagak:preferences", JSON.stringify({
      version: 2,
      preferences: { ...defaultAppPreferences, interfaceLanguage: "ko" },
    }));
    localStorage.setItem(historyKey, JSON.stringify({ version: 3, records: [currentRecord] }));
    const backup = makeBackup([makeRecord("same-id", 10, "imported"), makeRecord("new-id", 30)]);

    expect(await restoreDataBackup(backup, "merge")).toEqual({ ok: true });
    expect(await restoreDataBackup(backup, "merge")).toEqual({ ok: true });
    const importedHistory = JSON.parse(localStorage.getItem(historyKey) ?? "{}");
    expect(importedHistory.records).toHaveLength(2);
    expect(importedHistory.records.find((record: PracticeRecord) => record.id === "same-id")?.materialId)
      .toBe("current");
    expect(localStorage.getItem("tagak:preferences")).toContain('"interfaceLanguage":"ko"');
    expect(localStorage.getItem(veniceStorageKey)).not.toBeNull();
  });

  it("does not merge into corrupt current data", async () => {
    localStorage.setItem(historyKey, "{broken");
    expect(await restoreDataBackup(makeBackup(), "merge"))
      .toEqual({ ok: false, reason: "invalid-current-data" });
    expect(localStorage.getItem(historyKey)).toBe("{broken");
  });

  it("restores the previous values if a storage write fails", async () => {
    const previous = JSON.stringify({ version: 3, records: [makeRecord("kept", 10)] });
    localStorage.setItem(historyKey, previous);
    localStorage.setItem("tagak:preferences", "old-preferences");
    failNextWriteTo = "tagak:practice-font";

    expect(await restoreDataBackup(makeBackup([makeRecord("new", 20)]), "replace"))
      .toEqual({ ok: false, reason: "storage-failed" });
    expect(localStorage.getItem(historyKey)).toBe(previous);
    expect(localStorage.getItem("tagak:preferences")).toBe("old-preferences");
    expect(localStorage.getItem("tagak:practice-font")).toBeNull();
  });
});
