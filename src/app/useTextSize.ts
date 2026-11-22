import { useEffect, useRef, useState } from "react";
import { defaultSize, migrateTextSize, readTextSize, saveTextSize, settingsKey } from "../storage/settingsStorage";
import type { TextSize } from "../storage/settingsStorage";
import { storedDataChangedEvent } from "../storage/storageEvents";

export function useTextSize() {
  const [stored, setStored] = useState(readTextSize);
  const [temporary, setTemporary] = useState<TextSize | null>(null);
  const [notice, setNotice] = useState("");
  const request = useRef(0);

  useEffect(() => {
    let active = true;
    void migrateTextSize().then(() => {
      if (active) setStored(readTextSize());
    });
    function sync(event: StorageEvent) {
      if (event.key === settingsKey || event.key === null) setStored(readTextSize());
    }
    window.addEventListener("storage", sync);
    const syncRestored = () => { setStored(readTextSize()); setTemporary(null); setNotice(""); };
    window.addEventListener(storedDataChangedEvent, syncRestored);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener(storedDataChangedEvent, syncRestored);
    };
  }, []);

  async function change(size: TextSize, reset = false) {
    const version = ++request.current;
    setTemporary(size);
    const saved = await saveTextSize(size, reset);
    if (version !== request.current) return;
    if (saved) {
      setStored(readTextSize());
      setTemporary(null);
      setNotice("");
    } else {
      setNotice("save-failed");
    }
  }

  return {
    size: temporary ?? stored ?? defaultSize,
    change,
    notice: notice || (stored === null ? "invalid" : ""),
  };
}
