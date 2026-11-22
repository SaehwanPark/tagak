import type { AppPreferences } from "./appPreferences";
import { decodeAppPreferences } from "./appPreferences";
import {
  decodeColorTheme,
  decodePracticeFonts,
  decodeTextSize,
} from "./settingsStorage";
import type { ColorTheme, PracticeFonts, TextSize } from "./settingsStorage";
import { decodeHistory, historyVersion } from "./historyStorage";
import type { PracticeRecord } from "../domain/history";
import { recentRecords } from "../domain/history";
import {
  rankVeniceTopScores,
  veniceRecentRunLimit,
  veniceRulesVersion,
  veniceTopScoreLimit,
} from "../domain/venice";
import type { VeniceRun } from "../domain/venice";
import {
  legacyStorageKey,
  readStorageValue,
  storageEntryKeys,
  storageKeys,
  withStorageEntriesLock,
} from "./legacyStorage";
import type { StorageEntry } from "./legacyStorage";
import { decodeVeniceRecords, veniceStorageKey, veniceStorageVersion } from "./veniceStorage";
import { notifyStoredDataChanged } from "./storageEvents";

const backupFormat = "tagak-data-backup";
const backupVersion = 1;
const storageEntries: readonly StorageEntry[] = [
  "preferences",
  "display",
  "colorTheme",
  "practiceFont",
  "history",
];
const dataKeys = [
  storageKeys.preferences,
  storageKeys.display,
  storageKeys.colorTheme,
  storageKeys.practiceFont,
  storageKeys.history,
  veniceStorageKey,
] as const;
const markerValue = "1";

export type BackupData = Readonly<{
  preferences: AppPreferences;
  textSize: TextSize;
  colorTheme: ColorTheme;
  practiceFonts: PracticeFonts;
  history: readonly PracticeRecord[];
  venice: Readonly<{ recentRuns: readonly VeniceRun[]; topScores: readonly VeniceRun[] }>;
}>;

export type DataBackup = Readonly<{
  format: typeof backupFormat;
  version: typeof backupVersion;
  exportedAt: string;
  data: BackupData;
}>;

export type BackupRead =
  | Readonly<{ ok: true; backup: DataBackup }>
  | Readonly<{ ok: false }>;

export type RestoreResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; reason: "invalid-current-data" | "storage-failed" }>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableData(data: BackupData): BackupData {
  return {
    ...data,
    history: recentRecords(data.history),
    venice: {
      recentRuns: [...data.venice.recentRuns]
        .sort((left, right) => left.completedAt - right.completedAt || left.id.localeCompare(right.id))
        .slice(-veniceRecentRunLimit),
      topScores: rankVeniceTopScores(data.venice.topScores).slice(0, veniceTopScoreLimit),
    },
  };
}

function serializeData(data: BackupData): string {
  const normalized = stableData(data);
  return JSON.stringify({
    format: backupFormat,
    version: backupVersion,
    exportedAt: new Date().toISOString(),
    data: {
      preferences: { version: 2, preferences: normalized.preferences },
      textSize: { version: 1, size: normalized.textSize },
      colorTheme: { version: 1, theme: normalized.colorTheme },
      practiceFonts: { version: 2, fonts: normalized.practiceFonts },
      history: { version: historyVersion, records: normalized.history },
      venice: {
        version: veniceStorageVersion,
        rulesVersion: veniceRulesVersion,
        recentRuns: normalized.venice.recentRuns,
        topScores: normalized.venice.topScores,
      },
    },
  }, null, 2);
}

function readStoredData(): BackupData | null {
  const preferences = decodeAppPreferences(readStorageValue("preferences"));
  const textSize = decodeTextSize(readStorageValue("display"));
  const colorTheme = decodeColorTheme(readStorageValue("colorTheme"));
  const practiceFonts = decodePracticeFonts(readStorageValue("practiceFont"));
  const history = decodeHistory(readStorageValue("history"));
  const venice = decodeVeniceRecords(localStorage.getItem(veniceStorageKey));
  if (!preferences.valid || textSize === null || colorTheme === null || practiceFonts === null ||
      !history.ok || !venice.ok) return null;
  return stableData({
    preferences: preferences.value,
    textSize,
    colorTheme,
    practiceFonts,
    history: history.records,
    venice: venice.records,
  });
}

export function createDataBackup(): string | null {
  try {
    const data = readStoredData();
    return data === null ? null : serializeData(data);
  } catch {
    return null;
  }
}

function decodeVeniceRuns(value: unknown): readonly VeniceRun[] | null {
  if (!Array.isArray(value) || value.length > 1_000) return null;
  const unique = new Map<string, VeniceRun>();
  for (const candidate of value) {
    const decoded = decodeVeniceRecords(JSON.stringify({
      version: veniceStorageVersion,
      rulesVersion: veniceRulesVersion,
      recentRuns: [candidate],
      topScores: [],
    }));
    if (!decoded.ok || decoded.records.recentRuns.length !== 1) return null;
    const run = decoded.records.recentRuns[0];
    if (!run) return null;
    unique.set(run.id, run);
  }
  return Array.from(unique.values());
}

function decodeBackupData(value: unknown): BackupData | null {
  if (!isObject(value)) return null;
  const preferences = decodeAppPreferences(JSON.stringify(value.preferences));
  const textSize = decodeTextSize(JSON.stringify(value.textSize));
  const colorTheme = decodeColorTheme(JSON.stringify(value.colorTheme));
  const practiceFonts = decodePracticeFonts(JSON.stringify(value.practiceFonts));
  const history = decodeHistory(JSON.stringify(value.history));
  if (!preferences.valid || textSize === null || colorTheme === null || practiceFonts === null || !history.ok) {
    return null;
  }

  if (!isObject(value.venice) || value.venice.version !== veniceStorageVersion ||
      value.venice.rulesVersion !== veniceRulesVersion) return null;
  const recentRuns = decodeVeniceRuns(value.venice.recentRuns);
  const topScores = decodeVeniceRuns(value.venice.topScores);
  if (recentRuns === null || topScores === null) return null;
  const venice = decodeVeniceRecords(JSON.stringify({
    version: veniceStorageVersion,
    rulesVersion: veniceRulesVersion,
    recentRuns: [...recentRuns].sort((left, right) => left.completedAt - right.completedAt).slice(-veniceRecentRunLimit),
    topScores: rankVeniceTopScores(topScores).slice(0, veniceTopScoreLimit),
  }));
  if (!venice.ok) return null;

  return stableData({
    preferences: preferences.value,
    textSize,
    colorTheme,
    practiceFonts,
    history: history.records,
    venice: venice.records,
  });
}

export function decodeDataBackup(raw: string): BackupRead {
  if (raw.length > 2_000_000) return { ok: false };
  try {
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || value.format !== backupFormat || value.version !== backupVersion ||
        typeof value.exportedAt !== "string" || Number.isNaN(Date.parse(value.exportedAt))) {
      return { ok: false };
    }
    const data = decodeBackupData(value.data);
    return data === null
      ? { ok: false }
      : { ok: true, backup: { format: backupFormat, version: backupVersion, exportedAt: value.exportedAt, data } };
  } catch {
    return { ok: false };
  }
}

export function hasStoredData(): boolean {
  try {
    return dataKeys.some((key) => localStorage.getItem(key) !== null) || storageEntries.some((entry) => {
      const keys = storageEntryKeys(entry);
      return localStorage.getItem(keys.legacy) !== null;
    });
  } catch {
    return true;
  }
}

function mergeData(existing: BackupData, imported: BackupData, stored: ReadonlySet<StorageEntry>): BackupData {
  const historyById = new Map(imported.history.map((record) => [record.id, record]));
  for (const record of existing.history) historyById.set(record.id, record);

  const recentById = new Map(imported.venice.recentRuns.map((run) => [run.id, run]));
  for (const run of existing.venice.recentRuns) recentById.set(run.id, run);
  const topById = new Map(imported.venice.topScores.map((run) => [run.id, run]));
  for (const run of existing.venice.topScores) topById.set(run.id, run);

  return stableData({
    preferences: stored.has("preferences") ? existing.preferences : imported.preferences,
    textSize: stored.has("display") ? existing.textSize : imported.textSize,
    colorTheme: stored.has("colorTheme") ? existing.colorTheme : imported.colorTheme,
    practiceFonts: stored.has("practiceFont") ? existing.practiceFonts : imported.practiceFonts,
    history: Array.from(historyById.values()),
    venice: {
      recentRuns: Array.from(recentById.values()),
      topScores: Array.from(topById.values()),
    },
  });
}

function serializeStorage(data: BackupData): Readonly<Record<(typeof dataKeys)[number], string>> {
  const normalized = stableData(data);
  return {
    [storageKeys.preferences]: JSON.stringify({ version: 2, preferences: normalized.preferences }),
    [storageKeys.display]: JSON.stringify({ version: 1, size: normalized.textSize }),
    [storageKeys.colorTheme]: JSON.stringify({ version: 1, theme: normalized.colorTheme }),
    [storageKeys.practiceFont]: JSON.stringify({ version: 2, fonts: normalized.practiceFonts }),
    [storageKeys.history]: JSON.stringify({ version: historyVersion, records: normalized.history }),
    [veniceStorageKey]: JSON.stringify({
      version: veniceStorageVersion,
      rulesVersion: veniceRulesVersion,
      recentRuns: normalized.venice.recentRuns,
      topScores: normalized.venice.topScores,
    }),
  };
}

function snapshotStorage(): ReadonlyMap<string, string | null> {
  const keys = new Set<string>(dataKeys);
  for (const entry of storageEntries) {
    const definition = storageEntryKeys(entry);
    keys.add(definition.legacy);
    keys.add(definition.marker);
  }
  return new Map(Array.from(keys, (key) => [key, localStorage.getItem(key)]));
}

function restoreSnapshot(snapshot: ReadonlyMap<string, string | null>): void {
  for (const [key, value] of snapshot) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
}

function writeData(data: BackupData): boolean {
  const values = serializeStorage(data);
  try {
    for (const [key, value] of Object.entries(values)) {
      localStorage.setItem(key, value);
      if (localStorage.getItem(key) !== value) return false;
    }
    for (const entry of storageEntries) {
      const definition = storageEntryKeys(entry);
      localStorage.setItem(definition.marker, markerValue);
      if (localStorage.getItem(definition.marker) !== markerValue) return false;
      localStorage.removeItem(legacyStorageKey(entry));
      if (localStorage.getItem(definition.legacy) !== null) return false;
    }
    return readStoredData() !== null;
  } catch {
    return false;
  }
}

export async function restoreDataBackup(
  backup: DataBackup,
  mode: "merge" | "replace",
): Promise<RestoreResult> {
  try {
    const result = await withStorageEntriesLock(storageEntries, () =>
      navigator.locks.request(veniceStorageKey, async () => {
        const snapshot = snapshotStorage();
        let next = backup.data;
        if (mode === "merge") {
          const current = readStoredData();
          if (current === null) return { ok: false, reason: "invalid-current-data" } as const;
          const stored = new Set(storageEntries.filter((entry) => {
            const keys = storageEntryKeys(entry);
            return localStorage.getItem(keys.current) !== null || localStorage.getItem(keys.legacy) !== null;
          }));
          next = mergeData(current, backup.data, stored);
        }
        if (writeData(next)) return { ok: true } as const;
        try {
          restoreSnapshot(snapshot);
        } catch {
          // Keep the failed write visible to the caller if the storage itself rejects rollback.
        }
        return { ok: false, reason: "storage-failed" } as const;
      }),
    );
    if (result.ok) notifyStoredDataChanged();
    return result;
  } catch {
    return { ok: false, reason: "storage-failed" };
  }
}
