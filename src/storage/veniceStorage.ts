import {
  rankVeniceTopScores,
  shouldRecordVeniceRun,
  veniceRecentRunLimit,
  veniceRulesVersion,
  veniceTopScoreLimit,
} from "../domain/venice";
import type { VeniceLevelStats, VeniceRun } from "../domain/venice";

export const veniceStorageKey = "tagak:venice:records";
const schemaVersion = 1;

export type VeniceRecords = Readonly<{
  recentRuns: readonly VeniceRun[];
  topScores: readonly VeniceRun[];
}>;

export type VeniceStorageRead =
  | Readonly<{ ok: true; records: VeniceRecords }>
  | Readonly<{ ok: false; records: null }>;

const emptyRecords: VeniceRecords = { recentRuns: [], topScores: [] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isTime(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 8.64e15;
}

function isLevelStats(value: unknown): value is VeniceLevelStats {
  if (!isObject(value)) return false;
  return isCount(value.level) && value.level >= 1 && value.level <= 14
    && isCount(value.spawned) && (value.level === 14 || value.spawned <= 20)
    && isCount(value.typedCorrectly) && value.typedCorrectly <= value.spawned
    && isCount(value.missed) && value.missed <= value.spawned
    && value.typedCorrectly + value.missed <= value.spawned
    && isTime(value.durationMs);
}

function isVeniceRun(value: unknown): value is VeniceRun {
  if (!isObject(value) || !Array.isArray(value.levelStats) || value.levelStats.length === 0 || value.levelStats.length > 14) {
    return false;
  }
  const levelStats = value.levelStats;
  if (!levelStats.every(isLevelStats)) return false;
  const first = levelStats[0];
  const last = levelStats[levelStats.length - 1];
  if (!first || !last || first.level !== value.startLevel || last.level !== value.highestLevel) return false;
  if (levelStats.some((stats, index) => index > 0 && stats.level !== (levelStats[index - 1]?.level ?? 0) + 1)) return false;

  return typeof value.id === "string" && value.id.length > 0 && value.id.length <= 128
    && value.rulesVersion === veniceRulesVersion
    && isTime(value.startedAt) && isTime(value.completedAt) && value.completedAt >= value.startedAt
    && isCount(value.startLevel) && value.startLevel >= 1 && value.startLevel <= 14
    && isCount(value.highestLevel) && value.highestLevel >= value.startLevel && value.highestLevel <= 14
    && isCount(value.score) && value.score <= Number.MAX_SAFE_INTEGER
    && isCount(value.typedWords) && isCount(value.missedWords)
    && isTime(value.durationMs);
}

export function decodeVeniceRecords(raw: string | null): VeniceStorageRead {
  if (raw === null) return { ok: true, records: emptyRecords };
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || value.version !== schemaVersion || value.rulesVersion !== veniceRulesVersion
      || !Array.isArray(value.recentRuns) || !Array.isArray(value.topScores)
      || value.recentRuns.length > veniceRecentRunLimit || value.topScores.length > veniceTopScoreLimit
      || !value.recentRuns.every(isVeniceRun) || !value.topScores.every(isVeniceRun)) {
      return { ok: false, records: null };
    }
    const recentRuns = value.recentRuns as VeniceRun[];
    const topScores = value.topScores as VeniceRun[];
    if (new Set(recentRuns.map((run) => run.id)).size !== recentRuns.length
      || new Set(topScores.map((run) => run.id)).size !== topScores.length) {
      return { ok: false, records: null };
    }
    return {
      ok: true,
      records: {
        recentRuns: [...recentRuns].sort((left, right) => left.completedAt - right.completedAt),
        topScores: rankVeniceTopScores(topScores),
      },
    };
  } catch {
    return { ok: false, records: null };
  }
}

export function readVeniceRecords(): VeniceStorageRead {
  try {
    return decodeVeniceRecords(localStorage.getItem(veniceStorageKey));
  } catch {
    return { ok: false, records: null };
  }
}

function withVeniceLock<Result>(operation: () => Result | Promise<Result>): Promise<Result> {
  if (typeof navigator === "undefined" || !navigator.locks) return Promise.resolve(operation());
  return navigator.locks.request(veniceStorageKey, { mode: "exclusive" }, operation);
}

export function saveVeniceRun(run: VeniceRun): Promise<VeniceStorageRead> {
  if (!isVeniceRun(run)) return Promise.resolve({ ok: false, records: null });
  if (!shouldRecordVeniceRun(run)) return Promise.resolve(readVeniceRecords());
  return withVeniceLock(() => {
    const previous = readVeniceRecords();
    if (!previous.ok) return previous;
    if (previous.records.recentRuns.some((item) => item.id === run.id)
      || previous.records.topScores.some((item) => item.id === run.id)) return previous;

    const recentRuns = [...previous.records.recentRuns, run].slice(-veniceRecentRunLimit);
    const topScores = rankVeniceTopScores([...previous.records.topScores, run]);
    const serialized = JSON.stringify({ version: schemaVersion, rulesVersion: veniceRulesVersion, recentRuns, topScores });
    try {
      localStorage.setItem(veniceStorageKey, serialized);
      const saved = localStorage.getItem(veniceStorageKey);
      if (saved !== serialized) return { ok: false as const, records: null };
      return decodeVeniceRecords(saved);
    } catch {
      return { ok: false as const, records: null };
    }
  }).catch(() => ({ ok: false as const, records: null }));
}
