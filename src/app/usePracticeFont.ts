import { useEffect, useRef, useState } from "react";
import {
  defaultPracticeFonts,
  migratePracticeFonts,
  practiceFontKey,
  readPracticeFonts,
  resetPracticeFonts,
  savePracticeFont,
} from "../storage/settingsStorage";
import type { PracticeFont, PracticeFonts } from "../storage/settingsStorage";
import type { Language } from "../content/lessons";
import { storedDataChangedEvent } from "../storage/storageEvents";

export function usePracticeFont(language: Language) {
  const [stored, setStored] = useState<PracticeFonts | null>(readPracticeFonts);
  const [temporary, setTemporary] = useState<PracticeFonts | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);
  const font = (temporary ?? stored ?? defaultPracticeFonts)[language];

  useEffect(() => {
    document.documentElement.dataset.practiceFont = font;
  }, [font]);

  useEffect(() => {
    let active = true;
    void migratePracticeFonts().then(() => {
      if (active) setStored(readPracticeFonts());
    });
    function sync(event: StorageEvent) {
      if (event.key === practiceFontKey || event.key === null) setStored(readPracticeFonts());
    }
    window.addEventListener("storage", sync);
    const syncRestored = () => { setStored(readPracticeFonts()); setTemporary(null); setNotice(""); };
    window.addEventListener(storedDataChangedEvent, syncRestored);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener(storedDataChangedEvent, syncRestored);
    };
  }, []);

  async function change(nextFont: PracticeFont, reset = false) {
    const version = ++request.current;
    const next = { ...(temporary ?? stored ?? defaultPracticeFonts), [language]: nextFont };
    setTemporary(next);
    const saved = await savePracticeFont(nextFont, reset, language);
    if (version !== request.current) return;
    if (saved) {
      setStored(readPracticeFonts());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("save-failed");
    }
  }

  async function resetAll() {
    const version = ++request.current;
    setTemporary(defaultPracticeFonts);
    const saved = await resetPracticeFonts();
    if (version !== request.current) return;
    if (saved) {
      setStored(defaultPracticeFonts);
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("save-failed");
    }
  }

  return {
    font,
    change,
    resetAll,
    notice: notice ? "save-failed" : stored === null ? "invalid" : "",
  };
}
