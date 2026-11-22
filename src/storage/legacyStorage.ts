export const storageKeys = {
  preferences: "tagak:preferences",
  display: "tagak:display",
  colorTheme: "tagak:color-theme",
  practiceFont: "tagak:practice-font",
  history: "tagak:history",
} as const;

export type StorageEntry = keyof typeof storageKeys;

export type StorageEntryKeys = Readonly<{
  current: string;
  legacy: string;
  marker: string;
}>;

type StorageEntryDefinition = Readonly<{
  currentKey: string;
  legacyKey: string;
  markerKey: string;
}>;

const entries: Readonly<Record<StorageEntry, StorageEntryDefinition>> = {
  preferences: {
    currentKey: storageKeys.preferences,
    legacyKey: "retro-typing-playground:preferences",
    markerKey: "tagak:migration:preferences",
  },
  display: {
    currentKey: storageKeys.display,
    legacyKey: "retro-typing-playground:display",
    markerKey: "tagak:migration:display",
  },
  colorTheme: {
    currentKey: storageKeys.colorTheme,
    legacyKey: "retro-typing-playground:color-theme",
    markerKey: "tagak:migration:color-theme",
  },
  practiceFont: {
    currentKey: storageKeys.practiceFont,
    legacyKey: "retro-typing-playground:practice-font",
    markerKey: "tagak:migration:practice-font",
  },
  history: {
    currentKey: storageKeys.history,
    legacyKey: "retro-typing-playground:history",
    markerKey: "tagak:migration:history",
  },
};

const migrationComplete = "1";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function legacyStorageKey(entry: StorageEntry): string {
  return entries[entry].legacyKey;
}

export function storageEntryKeys(entry: StorageEntry): StorageEntryKeys {
  const definition = entries[entry];
  return {
    current: definition.currentKey,
    legacy: definition.legacyKey,
    marker: definition.markerKey,
  };
}

/** Reads new data first; the legacy value is a read-only fallback until it is migrated. */
export function readStorageValue(entry: StorageEntry, storage: StorageLike = localStorage): string | null {
  const definition = entries[entry];
  const current = storage.getItem(definition.currentKey);
  if (current !== null) return current;
  if (storage.getItem(definition.markerKey) === migrationComplete) return null;
  return storage.getItem(definition.legacyKey);
}

/** Run inside both the current and previous Web Locks, in this order. */
export function migrateStorageValue(
  entry: StorageEntry,
  isValid: (raw: string) => boolean,
  storage: StorageLike = localStorage,
): boolean {
  const definition = entries[entry];
  const current = storage.getItem(definition.currentKey);
  if (current !== null) {
    writeMarkerBestEffort(definition.markerKey, storage);
    return true;
  }
  if (storage.getItem(definition.markerKey) === migrationComplete) return true;

  const legacy = storage.getItem(definition.legacyKey);
  if (legacy === null) {
    writeMarkerBestEffort(definition.markerKey, storage);
    return true;
  }
  if (!isValid(legacy)) return true;

  try {
    storage.setItem(definition.currentKey, legacy);
    const copied = storage.getItem(definition.currentKey);
    if (copied !== legacy || !isValid(copied)) {
      if (copied !== null) storage.removeItem(definition.currentKey);
      return false;
    }

    try {
      storage.setItem(definition.markerKey, migrationComplete);
      if (storage.getItem(definition.markerKey) === migrationComplete) {
        storage.removeItem(definition.legacyKey);
      }
    } catch {
      // The verified new value remains authoritative; keep the source if cleanup cannot finish.
    }
    return true;
  } catch {
    return false;
  }
}

export async function ensureStorageMigrated(
  entry: StorageEntry,
  isValid: (raw: string) => boolean,
): Promise<boolean> {
  try {
    return await withStorageEntryLock(entry, () => migrateStorageValue(entry, isValid));
  } catch {
    return false;
  }
}

export function withStorageEntryLock<Result>(
  entry: StorageEntry,
  operation: () => Result | Promise<Result>,
): Promise<Result> {
  return navigator.locks.request(storageKeys[entry], () =>
    navigator.locks.request(entries[entry].legacyKey, operation));
}

/** Acquires every current key before every legacy key, matching single-entry writers. */
export function withStorageEntriesLock<Result>(
  selected: readonly StorageEntry[],
  operation: () => Result | Promise<Result>,
): Promise<Result> {
  const definitions = Array.from(new Set(selected), storageEntryKeys);
  const keys = [
    ...definitions.map(({ current }) => current).sort(),
    ...definitions.map(({ legacy }) => legacy).sort(),
  ];
  const withLock = (index: number): Promise<Result> => {
    const key = keys[index];
    return key === undefined
      ? Promise.resolve(operation())
      : navigator.locks.request(key, () => withLock(index + 1));
  };
  return withLock(0);
}

/** Explicit reset also tombstones legacy data so an older open tab cannot restore it. */
export function resetStorageValue(entry: StorageEntry, storage: StorageLike = localStorage): boolean {
  const definition = entries[entry];
  try {
    storage.setItem(definition.markerKey, migrationComplete);
    if (storage.getItem(definition.markerKey) !== migrationComplete) return false;
    storage.removeItem(definition.currentKey);
    storage.removeItem(definition.legacyKey);
    return true;
  } catch {
    return false;
  }
}

function writeMarkerBestEffort(markerKey: string, storage: StorageLike): void {
  try {
    storage.setItem(markerKey, migrationComplete);
  } catch {
    // The data itself remains available; explicit reset retries the marker before deleting anything.
  }
}
