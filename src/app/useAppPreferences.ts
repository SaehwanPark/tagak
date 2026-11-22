import { useEffect, useRef, useState } from "react";
import {
  appPreferencesKey,
  defaultAppPreferences,
  migrateAppPreferences,
  readAppPreferences,
  saveAppPreferences,
} from "../storage/appPreferences";
import type { AppPreferences, AppPreferencesRead } from "../storage/appPreferences";
import { storedDataChangedEvent } from "../storage/storageEvents";

export function useAppPreferences() {
  const [stored, setStored] = useState<AppPreferencesRead>(readAppPreferences);
  const [temporary, setTemporary] = useState<AppPreferences | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const request = useRef(0);
  const preferences = temporary ?? stored.value;

  useEffect(() => {
    let active = true;
    const initialRequest = request.current;
    void migrateAppPreferences().then(() => {
      if (active && request.current === initialRequest) setStored(readAppPreferences());
    });
    function sync(event: StorageEvent) {
      if (event.key === appPreferencesKey || event.key === null) {
        setStored(readAppPreferences());
        setTemporary(null);
        setSaveFailed(false);
      }
    }
    window.addEventListener("storage", sync);
    const syncRestored = () => {
      setStored(readAppPreferences());
      setTemporary(null);
      setSaveFailed(false);
    };
    window.addEventListener(storedDataChangedEvent, syncRestored);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener(storedDataChangedEvent, syncRestored);
    };
  }, []);

  async function change(update: Partial<AppPreferences>, reset = false) {
    const version = ++request.current;
    const next = reset ? defaultAppPreferences : { ...preferences, ...update };
    setTemporary(next);
    const saved = await saveAppPreferences(next, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readAppPreferences());
      setTemporary(null);
      setSaveFailed(false);
    } else {
      setSaveFailed(true);
    }
  }

  return {
    preferences,
    change,
    reset: () => change({}, true),
    notice: saveFailed ? "save-failed" : stored.valid ? "" : "invalid",
  } as const;
}
