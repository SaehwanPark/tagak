import { useEffect, useRef, useState } from "react";
import {
  colorThemeKey,
  defaultColorTheme,
  migrateColorTheme,
  readColorTheme,
  saveColorTheme,
} from "../storage/settingsStorage";
import type { ColorTheme } from "../storage/settingsStorage";
import { storedDataChangedEvent } from "../storage/storageEvents";

export function useColorTheme() {
  const [stored, setStored] = useState(readColorTheme);
  const [temporary, setTemporary] = useState<ColorTheme | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const theme = temporary ?? stored ?? defaultColorTheme;

  useEffect(() => {
    document.documentElement.dataset.colorTheme = theme;
  }, [theme]);

  useEffect(() => {
    let active = true;
    void migrateColorTheme().then(() => {
      if (active) setStored(readColorTheme());
    });
    function sync(event: StorageEvent) {
      if (event.key === colorThemeKey || event.key === null) setStored(readColorTheme());
    }
    window.addEventListener("storage", sync);
    const syncRestored = () => { setStored(readColorTheme()); setTemporary(null); setNotice(""); };
    window.addEventListener(storedDataChangedEvent, syncRestored);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener(storedDataChangedEvent, syncRestored);
    };
  }, []);

  async function change(nextTheme: ColorTheme, reset = false) {
    const version = ++request.current;
    setTemporary(nextTheme);
    const saved = await saveColorTheme(nextTheme, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readColorTheme());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("save-failed");
    }
  }

  return {
    theme,
    change,
    notice: notice || (stored === null ? "invalid" : ""),
  };
}
