import { useEffect, useState } from "react";
import { recentRecords } from "../domain/history";
import type { PracticeRecord, PracticeSessionRecord } from "../domain/history";
import type { HighScoreDecision } from "../domain/sessionHighScore";
import { clearHighScores, clearHistory, historyKey, migrateHistory, readHistory, savePracticeSession, saveRecord } from "../storage/historyStorage";
import { storedDataChangedEvent } from "../storage/storageEvents";

export function useHistory(
  record: PracticeRecord | undefined,
  session: PracticeSessionRecord | undefined,
  acknowledge: (id: string) => void,
  acknowledgeSession: (id: string) => void,
) {
  const [saved, setSaved] = useState(readHistory);
  const [temporary, setTemporary] = useState<PracticeRecord[]>([]);
  const [temporarySessions, setTemporarySessions] = useState<PracticeSessionRecord[]>([]);
  const [notice, setNotice] = useState("");
  const [latestSessionSave, setLatestSessionSave] = useState<Readonly<{
    id: string;
    completion: PracticeSessionRecord["completion"];
    decision: HighScoreDecision | null;
    highScoreDecisionFailed: boolean;
    ok: boolean;
    duplicate: boolean;
  }> | null>(null);

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
      setTemporarySessions([]);
      setNotice("");
      setLatestSessionSave(null);
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

  useEffect(() => {
    if (!session) return;
    let active = true;
    void savePracticeSession(session).then((result) => {
      if (!active) return;
      if (result.ok) {
        setSaved(result.history);
        setTemporarySessions((previous) => previous.filter((entry) => entry.id !== session.id));
        setNotice("");
        setLatestSessionSave({
          id: session.id,
          completion: session.completion,
          decision: result.decision,
          highScoreDecisionFailed: result.highScoreDecisionFailed,
          ok: true,
          duplicate: result.duplicate,
        });
      } else {
        setSaved(readHistory());
        setTemporarySessions((previous) => [
          ...previous.filter((entry) => entry.id !== session.id),
          session,
        ].sort((left, right) => right.completedAt - left.completedAt).slice(0, 100));
        setNotice("session-save-failed");
        setLatestSessionSave({
          id: session.id,
          completion: session.completion,
          decision: null,
          highScoreDecisionFailed: false,
          ok: false,
          duplicate: false,
        });
      }
      acknowledgeSession(session.id);
    });
    return () => { active = false; };
  }, [session, acknowledgeSession]);

  async function reset() {
    if (!await clearHistory()) {
      setNotice("history-clear-failed");
      return false;
    }

    setSaved(readHistory());
    setTemporary([]);
    setTemporarySessions([]);
    setNotice("history-cleared");
    setLatestSessionSave(null);
    return true;
  }

  async function resetHighScores() {
    if (!await clearHighScores()) {
      setNotice("history-clear-failed");
      return false;
    }
    setSaved(readHistory());
    setNotice("high-scores-cleared");
    setLatestSessionSave(null);
    return true;
  }

  return {
    records: recentRecords([...saved.records, ...temporary]),
    sessions: [...saved.sessions, ...temporarySessions]
      .sort((left, right) => right.completedAt - left.completedAt || left.id.localeCompare(right.id))
      .slice(0, 100),
    highScores: saved.highScores,
    latestSessionSave,
    notice: notice || (saved.ok ? "" : "history-read-failed"),
    reset,
    resetHighScores,
  };
}
