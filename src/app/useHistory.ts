import { useEffect, useState } from "react";
import { recentRecords } from "../domain/history";
import type { PracticeRecord } from "../domain/history";
import { clearHistory, historyKey, migrateHistory, readHistory, saveRecord } from "../storage/historyStorage";
import { storedDataChangedEvent } from "../storage/storageEvents";

export function useHistory(record: PracticeRecord | undefined, acknowledge: (id: string) => void) {
  const [saved, setSaved] = useState(readHistory);
  const [temporary, setTemporary] = useState<PracticeRecord[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void migrateHistory().then(() => {
      if (active) setSaved(readHistory());
    });
    function sync(event: StorageEvent) {
      if (event.key === historyKey || event.key === null) setSaved(readHistory());
    }
    window.addEventListener("storage", sync);
    const syncRestored = () => {
      setSaved(readHistory());
      setTemporary([]);
      setNotice("");
    };
    window.addEventListener(storedDataChangedEvent, syncRestored);
    return () => {
      active = false;
      window.removeEventListener("storage", sync);
      window.removeEventListener(storedDataChangedEvent, syncRestored);
    };
  }, []);

  useEffect(() => {
    if (!record) return;
    let active = true;
    void saveRecord(record).then((result) => {
      if (!active) return;
      if (result.ok) {
        setSaved(readHistory());
        setNotice("");
      } else {
        setTemporary((previous) => recentRecords([...previous, record]));
        setNotice("history-save-failed");
      }
      acknowledge(record.id);
    });
    return () => { active = false; };
  }, [record, acknowledge]);

  async function reset() {
    if (!await clearHistory()) {
      setNotice("history-clear-failed");
      return false;
    }

    setSaved(readHistory());
    setTemporary([]);
    setNotice("history-cleared");
    return true;
  }

  return {
    records: recentRecords([...saved.records, ...temporary]),
    notice: notice || (saved.ok ? "" : "history-read-failed"),
    reset,
  };
}
