import { modeLabels, recentRecords } from "../domain/history";
import type { PracticeRecord } from "../domain/history";
import type { TypingScore } from "../domain/typing";
import {
  ensureStorageMigrated,
  migrateStorageValue,
  readStorageValue,
  resetStorageValue,
  storageKeys,
  withStorageEntryLock,
} from "./legacyStorage";

export const historyKey = storageKeys.history;
export const historyVersion = 3;
const previousHistoryVersions = new Set([1, 2]);
const legacyModeNames: Record<string, PracticeRecord["mode"]> = {
  sentence: "line",
  article: "long",
};

export type HistoryRead =
  | { ok: true; records: PracticeRecord[] }
  | { ok: false; records: [] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isOptionalNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

function isOptionalCount(value: unknown): value is number | null {
  return value === null || (isNumber(value) && Number.isSafeInteger(value));
}

type LegacyTypingScore = Pick<TypingScore, "accuracy" | "correctCount" | "typedCount" | "elapsedMs" | "charactersPerMinute">;

type RecordEnvelope = Pick<PracticeRecord, "id" | "materialId" | "completedAt" | "language"> & {
  mode: string;
  score: unknown;
};

function normalizeRecordedMode(mode: string): PracticeRecord["mode"] | null {
  if (Object.hasOwn(modeLabels, mode)) return mode as PracticeRecord["mode"];
  return legacyModeNames[mode] ?? null;
}

function hasValidScoreCounts(score: Record<string, unknown>): boolean {
  const { typedCount, correctCount, accuracy, elapsedMs } = score;
  return isNumber(typedCount) && Number.isSafeInteger(typedCount)
    && isNumber(correctCount) && Number.isSafeInteger(correctCount) && correctCount <= typedCount
    && isOptionalNumber(accuracy) && (accuracy === null || accuracy <= 100)
    && isOptionalNumber(elapsedMs);
}

function isLegacyScore(score: unknown): score is LegacyTypingScore {
  if (!isObject(score)) return false;
  return hasValidScoreCounts(score) && isOptionalNumber(score.charactersPerMinute);
}

function isCurrentScore(score: unknown): score is TypingScore {
  if (!isObject(score)) return false;
  return hasValidScoreCounts(score)
    && isOptionalNumber(score.charactersPerMinute)
    && isOptionalCount(score.keystrokeCount)
    && isOptionalNumber(score.keystrokesPerMinute);
}

function isRecordEnvelope(value: unknown): value is RecordEnvelope {
  if (!isObject(value)) return false;
  return typeof value.id === "string" && value.id.length > 0
    && typeof value.materialId === "string" && value.materialId.length > 0
    && isNumber(value.completedAt) && value.completedAt <= 8.64e15
    && typeof value.mode === "string" && normalizeRecordedMode(value.mode) !== null
    && (value.language === "ko" || value.language === "en");
}

function decodeRecord(value: unknown, isLegacy: boolean): PracticeRecord | null {
  if (!isRecordEnvelope(value)) return null;
  const mode = normalizeRecordedMode(value.mode);
  if (!mode) return null;
  if (!isLegacy) {
    return isCurrentScore(value.score) ? { ...value, mode, score: value.score } : null;
  }
  if (!isLegacyScore(value.score)) return null;

  const hideLegacyKoreanSpeed = value.language === "ko" && mode !== "position";
  return {
    ...value,
    mode,
    score: {
      ...value.score,
      charactersPerMinute: hideLegacyKoreanSpeed ? null : value.score.charactersPerMinute,
      keystrokeCount: null,
      keystrokesPerMinute: null,
    },
  };
}

export function decodeHistory(raw: string | null): HistoryRead {
  if (raw === null) return { ok: true, records: [] };
  try {
    const data: unknown = JSON.parse(raw);
    const isLegacy = isObject(data) && data.version === 1;
    if (
      !isObject(data) ||
      (data.version !== historyVersion && !(typeof data.version === "number" && previousHistoryVersions.has(data.version))) ||
      !Array.isArray(data.records)
    ) return { ok: false, records: [] };

    const records = data.records.map((record) => decodeRecord(record, isLegacy));
    if (records.some((record) => record === null)) return { ok: false, records: [] };
    return {
      ok: true,
      records: recentRecords(records.filter((record): record is PracticeRecord => record !== null)),
    };
  } catch {
    return { ok: false, records: [] };
  }
}

export function readHistory(): HistoryRead {
  try {
    return decodeHistory(readStorageValue("history"));
  } catch {
    return { ok: false, records: [] };
  }
}

export function migrateHistory(): Promise<boolean> {
  return ensureStorageMigrated("history", (raw) => decodeHistory(raw).ok);
}

export async function saveRecord(record: PracticeRecord): Promise<HistoryRead> {
  try {
    return await withStorageEntryLock("history", () => {
      if (!migrateStorageValue("history", (raw) => decodeHistory(raw).ok)) {
        return { ok: false, records: [] };
      }
      const previous = readHistory();
      if (!previous.ok) return previous;
      if (previous.records.some((entry) => entry.id === record.id)) return previous;
      const records = recentRecords([...previous.records, record]);
      localStorage.setItem(historyKey, JSON.stringify({ version: historyVersion, records }));
      return { ok: true, records };
    });
  } catch {
    return { ok: false, records: [] };
  }
}

export async function clearHistory(): Promise<boolean> {
  try {
    return await withStorageEntryLock("history", () => resetStorageValue("history"));
  } catch {
    return false;
  }
}
