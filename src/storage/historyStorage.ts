import { modeLabels, recentRecords } from "../domain/history";
import type { PracticeHighScore, PracticeRecord, PracticeSessionRecord } from "../domain/history";
import type { TypingScore } from "../domain/typing";
import { decidePracticeHighScore, highScoreScopeKey, highScoreRulesVersion } from "../domain/sessionHighScore";
import type { HighScoreDecision } from "../domain/sessionHighScore";
import { isLinePracticeSessionLength } from "../domain/linePracticeSettings";
import {
  ensureStorageMigrated,
  migrateStorageValue,
  readStorageValue,
  resetStorageValue,
  storageKeys,
  withStorageEntryLock,
} from "./legacyStorage";

export const historyKey = storageKeys.history;
export const historyVersion = 4;
const previousHistoryVersions = new Set([1, 2, 3]);
const legacyModeNames: Record<string, PracticeRecord["mode"]> = {
  sentence: "line",
  article: "long",
};

export type HistoryRead =
  | { ok: true; records: PracticeRecord[]; sessions: PracticeSessionRecord[]; highScores: PracticeHighScore[] }
  | { ok: false; records: []; sessions: []; highScores: [] };

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

function isSessionRecord(value: unknown): value is PracticeSessionRecord {
  if (!isObject(value) || typeof value.id !== "string" || value.id.length === 0 ||
      !isNumber(value.completedAt) || value.completedAt > 8.64e15 ||
      !(value.mode === "line" || value.mode === "short" || value.mode === "long") ||
      !(value.language === "ko" || value.language === "en") ||
      !Array.isArray(value.materialIds) || value.materialIds.length === 0 ||
      value.materialIds.length > 1_000 ||
      value.materialIds.some((id) => typeof id !== "string" || id.length === 0) ||
      !Array.isArray(value.lineScores) || value.lineScores.length === 0 || value.lineScores.length > 1_000 ||
      !(value.completion === "completed" || value.completion === "early-exit")) return false;
  if (value.mode === "line") {
    if (!isLinePracticeSessionLength(value.lineSessionLength)) return false;
    if (value.lineScores.length > (value.lineSessionLength as number)) return false;
    if (value.completion === "completed" && value.lineScores.length !== value.lineSessionLength) return false;
  } else if (value.lineSessionLength !== null) {
    return false;
  }
  return value.lineScores.every(isCurrentScore);
}

function isPracticeHighScore(value: unknown): value is PracticeHighScore {
  if (!isObject(value) || value.rulesVersion !== highScoreRulesVersion ||
      !(value.mode === "line" || value.mode === "short" || value.mode === "long") ||
      !(value.language === "ko" || value.language === "en") ||
      typeof value.sessionId !== "string" || value.sessionId.length === 0 ||
      !isNumber(value.completedAt) || value.completedAt > 8.64e15 ||
      !Array.isArray(value.rawRates) || value.rawRates.length < 5 || value.rawRates.length > 1_000 ||
      value.rawRates.some((rate) => typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) ||
      !isNumber(value.median) || value.median <= 0 || typeof value.scopeKey !== "string") return false;
  const lineSessionLength = value.lineSessionLength;
  if (value.mode === "line") {
    if (!isLinePracticeSessionLength(lineSessionLength)) return false;
  } else if (lineSessionLength !== null) {
    return false;
  }
  const sortedRates = [...value.rawRates].sort((left, right) => left - right);
  const middle = Math.floor(sortedRates.length / 2);
  const calculatedMedian = sortedRates.length % 2 === 0
    ? (sortedRates[middle - 1] ?? 0) / 2 + (sortedRates[middle] ?? 0) / 2
    : sortedRates[middle];
  if (calculatedMedian !== value.median) return false;
  return value.scopeKey === highScoreScopeKey(
    value.mode,
    value.language,
    lineSessionLength as PracticeSessionRecord["lineSessionLength"],
  );
}

function uniqueSessions(sessions: readonly PracticeSessionRecord[]): PracticeSessionRecord[] {
  const byId = new Map(sessions.map((session) => [session.id, session]));
  return Array.from(byId.values())
    .sort((left, right) => right.completedAt - left.completedAt || left.id.localeCompare(right.id))
    .slice(0, 100);
}

function uniqueHighScores(highScores: readonly PracticeHighScore[]): PracticeHighScore[] {
  return Array.from(new Map(highScores.map((score) => [score.scopeKey, score])).values())
    .sort((left, right) => left.scopeKey.localeCompare(right.scopeKey));
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
  if (raw === null) return { ok: true, records: [], sessions: [], highScores: [] };
  try {
    const data: unknown = JSON.parse(raw);
    const isLegacy = isObject(data) && data.version === 1;
    if (
      !isObject(data) ||
      (data.version !== historyVersion && !(typeof data.version === "number" && previousHistoryVersions.has(data.version))) ||
      !Array.isArray(data.records)
    ) return { ok: false, records: [], sessions: [], highScores: [] };

    const records = data.records.map((record) => decodeRecord(record, isLegacy));
    if (records.some((record) => record === null)) return { ok: false, records: [], sessions: [], highScores: [] };
    if (data.version === historyVersion && (!Array.isArray(data.sessions) || !Array.isArray(data.highScores))) {
      return { ok: false, records: [], sessions: [], highScores: [] };
    }
    const sessions = data.version === historyVersion && Array.isArray(data.sessions)
      ? data.sessions.filter(isSessionRecord)
      : [];
    const highScores = data.version === historyVersion && Array.isArray(data.highScores)
      ? data.highScores.filter(isPracticeHighScore)
      : [];
    if (data.version === historyVersion &&
        (sessions.length !== (data.sessions as unknown[]).length || highScores.length !== (data.highScores as unknown[]).length)) {
      return { ok: false, records: [], sessions: [], highScores: [] };
    }
    return {
      ok: true,
      records: recentRecords(records.filter((record): record is PracticeRecord => record !== null)),
      sessions: uniqueSessions(sessions),
      highScores: uniqueHighScores(highScores),
    };
  } catch {
    return { ok: false, records: [], sessions: [], highScores: [] };
  }
}

export function readHistory(): HistoryRead {
  try {
    return decodeHistory(readStorageValue("history"));
  } catch {
    return { ok: false, records: [], sessions: [], highScores: [] };
  }
}

export function migrateHistory(): Promise<boolean> {
  return ensureStorageMigrated("history", (raw) => decodeHistory(raw).ok);
}

export async function saveRecord(record: PracticeRecord): Promise<HistoryRead> {
  try {
    return await withStorageEntryLock("history", () => {
      if (!migrateStorageValue("history", (raw) => decodeHistory(raw).ok)) {
        return { ok: false, records: [], sessions: [], highScores: [] };
      }
      const previous = readHistory();
      if (!previous.ok) return previous;
      if (previous.records.some((entry) => entry.id === record.id)) return previous;
      const records = recentRecords([...previous.records, record]);
      localStorage.setItem(historyKey, JSON.stringify({
        version: historyVersion,
        records,
        sessions: previous.sessions,
        highScores: previous.highScores,
      }));
      return readHistory();
    });
  } catch {
    return { ok: false, records: [], sessions: [], highScores: [] };
  }
}

export type PracticeSessionSave =
  | Readonly<{
      ok: true;
      history: Extract<HistoryRead, { ok: true }>;
      decision: HighScoreDecision;
      highScoreDecisionFailed: false;
      duplicate: boolean;
    }>
  | Readonly<{
      ok: true;
      history: Extract<HistoryRead, { ok: true }>;
      decision: null;
      highScoreDecisionFailed: true;
      duplicate: false;
    }>
  | Readonly<{
      ok: false;
      history: Extract<HistoryRead, { ok: false }>;
      decision: null;
      highScoreDecisionFailed: false;
      duplicate: false;
    }>;

export async function savePracticeSession(session: PracticeSessionRecord): Promise<PracticeSessionSave> {
  try {
    return await withStorageEntryLock("history", () => {
      if (!migrateStorageValue("history", (raw) => decodeHistory(raw).ok)) {
        return {
          ok: false,
          history: { ok: false, records: [], sessions: [], highScores: [] },
          decision: null,
          highScoreDecisionFailed: false,
          duplicate: false,
        };
      }
      const previous = readHistory();
      if (!previous.ok) {
        return {
          ok: false,
          history: previous,
          decision: null,
          highScoreDecisionFailed: false,
          duplicate: false,
        };
      }
      if (previous.sessions.some((entry) => entry.id === session.id)) {
        return {
          ok: true,
          history: previous,
          decision: { status: "already-saved" },
          highScoreDecisionFailed: false,
          duplicate: true,
        };
      }

      const key = highScoreScopeKey(session.mode, session.language, session.lineSessionLength);
      const currentHighScore = previous.highScores.find((entry) => entry.scopeKey === key);
      let result: ReturnType<typeof decidePracticeHighScore> | null = null;
      try {
        result = decidePracticeHighScore(session, currentHighScore);
      } catch {
        // A failed decision must not discard a completed session or replace its current high score.
      }
      const nextHistory = {
        records: previous.records,
        sessions: uniqueSessions([...previous.sessions, session]),
        highScores: uniqueHighScores(result?.next && result.next !== currentHighScore
          ? [...previous.highScores, result.next]
          : previous.highScores),
      };
      localStorage.setItem(historyKey, JSON.stringify({ version: historyVersion, ...nextHistory }));
      const saved = readHistory();
      if (!saved.ok) {
        return {
          ok: false,
          history: { ok: false, records: [], sessions: [], highScores: [] },
          decision: null,
          highScoreDecisionFailed: false,
          duplicate: false,
        };
      }
      return result
        ? {
            ok: true,
            history: saved,
            decision: result.decision,
            highScoreDecisionFailed: false,
            duplicate: false,
          }
        : {
            ok: true,
            history: saved,
            decision: null,
            highScoreDecisionFailed: true,
            duplicate: false,
          };
    });
  } catch {
    return {
      ok: false,
      history: { ok: false, records: [], sessions: [], highScores: [] },
      decision: null,
      highScoreDecisionFailed: false,
      duplicate: false,
    };
  }
}

export async function clearHighScores(): Promise<boolean> {
  try {
    return await withStorageEntryLock("history", () => {
      const current = readHistory();
      if (!current.ok) return false;
      const next = {
        version: historyVersion,
        records: current.records,
        sessions: current.sessions,
        highScores: [],
      };
      localStorage.setItem(historyKey, JSON.stringify(next));
      return readHistory().ok;
    });
  } catch {
    return false;
  }
}

export async function clearHistory(): Promise<boolean> {
  try {
    return await withStorageEntryLock("history", () => resetStorageValue("history"));
  } catch {
    return false;
  }
}
