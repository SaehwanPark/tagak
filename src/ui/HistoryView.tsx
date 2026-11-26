import { useEffect, useRef, useState } from "react";
import { modeLabels } from "../domain/history";
import type { PracticeHighScore, PracticeRecord, PracticeSessionRecord, RecordedMode } from "../domain/history";
import { useFocus } from "./useFocus";
import { handleScrollRegionKeyDown } from "./focusWithinScrollRegion";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import { toDisplayedTypingSpeed } from "../domain/typingSpeed";
import type { TypingSpeedUnits } from "../domain/typingSpeed";
import { sessionAccuracy, sessionSpeedSamples } from "../domain/sessionHighScore";
import { summarizeTypingRates } from "../domain/typingStatistics";

type HistoryViewProps = {
  records: readonly PracticeRecord[];
  sessions: readonly PracticeSessionRecord[];
  highScores: readonly PracticeHighScore[];
  onClear: () => Promise<boolean>;
  onClearHighScores: () => Promise<boolean>;
  onBack: () => void;
  copy: InterfaceText;
  interfaceLanguage: Language;
  typingSpeedUnits: TypingSpeedUnits;
};

export function HistoryView({
  records, sessions, highScores, onClear, onClearHighScores, onBack, copy, interfaceLanguage, typingSpeedUnits,
}: HistoryViewProps) {
  const title = useFocus<HTMLHeadingElement>();
  const dateFormat = new Intl.DateTimeFormat(interfaceLanguage === "ko" ? "ko" : "en", {
    dateStyle: "medium", timeStyle: "short",
  });
  const [filter, setFilter] = useState<RecordedMode | "all">("all");
  const [confirming, setConfirming] = useState(false);
  const [confirmingHighScores, setConfirmingHighScores] = useState(false);
  const [clearing, setClearing] = useState(false);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const highScoreCancelButton = useRef<HTMLButtonElement>(null);
  const confirmTrigger = useRef<HTMLButtonElement>(null);
  const highScoreConfirmTrigger = useRef<HTMLButtonElement>(null);
  const visible = records.filter((record) => filter === "all" || record.mode === filter);
  const visibleSessions = sessions.filter((session) => filter === "all" || session.mode === filter);

  // The confirmation opens on Cancel so a stray Enter or Esc cannot erase the records.
  useEffect(() => {
    if (confirming) cancelButton.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (confirmingHighScores) highScoreCancelButton.current?.focus();
  }, [confirmingHighScores]);

  async function clear() {
    setClearing(true);
    if (await onClear()) setConfirming(false);
    setClearing(false);
  }

  async function clearScores() {
    setClearing(true);
    if (await onClearHighScores()) setConfirmingHighScores(false);
    setClearing(false);
  }

  function dismissConfirm() {
    setConfirming(false);
    setConfirmingHighScores(false);
    confirmTrigger.current?.focus();
  }

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.key !== "Escape" || event.nativeEvent.isComposing ||
          event.target instanceof HTMLSelectElement) return;
      if (confirming) {
        dismissConfirm();
      } else if (confirmingHighScores) {
        setConfirmingHighScores(false);
        highScoreConfirmTrigger.current?.focus();
      } else {
        onBack();
      }
    }}>
      <button type="button" className="back" onClick={onBack}>{copy.backToSettings}</button>
      <h1 ref={title} tabIndex={-1}>{copy.activityLabel("history", "Recent practice")}</h1>
      <div className="history-toolbar">
        <label>{copy.practiceKind}{" "}
          <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
            <option value="all">{copy.all}</option>
            {Object.keys(modeLabels).map((mode) => <option value={mode} key={mode}>{copy.modeLabel(mode)}</option>)}
          </select>
        </label>
        <button
          ref={confirmTrigger}
          type="button"
          className="button secondary"
          // Opening the confirmation moves focus to Cancel so an accidental Enter cannot delete.
          onClick={() => { setConfirmingHighScores(false); setConfirming(true); }}
        >
          {copy.clearHistory}
        </button>
        {highScores.length > 0 && <button
          ref={highScoreConfirmTrigger}
          type="button"
          className="button secondary"
          onClick={() => { setConfirming(false); setConfirmingHighScores(true); }}
        >
          {copy.clearHighScores}
        </button>}
      </div>
      {confirming && (
        <div className="target" role="alertdialog" aria-label={copy.clearHistory} aria-describedby="clear-history-question">
          <p id="clear-history-question">{copy.confirmClearHistory}</p>
          <div className="result-actions">
            <button
              ref={cancelButton}
              type="button"
              className="button secondary"
              disabled={clearing}
              onClick={dismissConfirm}
            >
              {copy.cancel}
            </button>
            <button type="button" className="button" disabled={clearing} onClick={() => void clear()}>{copy.clearAllHistory}</button>
          </div>
        </div>
      )}
      {confirmingHighScores && (
        <div className="target" role="alertdialog" aria-label={copy.clearHighScores} aria-describedby="clear-high-scores-question">
          <p id="clear-high-scores-question">{copy.confirmClearHighScores}</p>
          <div className="result-actions">
            <button
              ref={highScoreCancelButton}
              type="button"
              className="button secondary"
              disabled={clearing}
              onClick={() => { setConfirmingHighScores(false); highScoreConfirmTrigger.current?.focus(); }}
            >
              {copy.cancel}
            </button>
            <button type="button" className="button" disabled={clearing} onClick={() => void clearScores()}>
              {copy.clearHighScoresAction}
            </button>
          </div>
        </div>
      )}
      <div
        className="history-content"
        role="region"
        aria-label={copy.activityLabel("history", "Recent practice")}
        tabIndex={0}
        data-scroll-region
        onKeyDown={handleScrollRegionKeyDown}
      >
      {highScores.length > 0 && (
        <section className="history-section" aria-labelledby="high-scores-title">
          <h2 id="high-scores-title">{copy.highScoresTitle}</h2>
          <ul className="history-list high-score-list">
            {highScores.map((score) => {
              const languageLabel = score.language === "ko" ? copy.korean : copy.english;
              const unit = typingSpeedUnits[score.language];
              const median = toDisplayedTypingSpeed(
                score.language === "en" ? score.median : null,
                score.language === "ko" ? score.median : null,
                score.language,
                unit,
              );
              return (
                <li key={score.scopeKey}>
                  <div><strong>{copy.highScoreScope(copy.modeLabel(score.mode), languageLabel, score.lineSessionLength)}</strong></div>
                  <span>{dateFormat.format(score.completedAt)}</span>
                  <div>
                    {median === null ? "—" : copy.speedValue(Math.round(median), unit, score.language)}
                    {` · ${copy.sessionSamples(score.rawRates.length)}`}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {visibleSessions.length > 0 && (
        <section className="history-section" aria-labelledby="session-history-title">
          <h2 id="session-history-title">{copy.sessionHistoryTitle}</h2>
          <ul className="history-list practice-session-list">
            {visibleSessions.map((session) => {
              const statistics = summarizeTypingRates(
                sessionSpeedSamples(session).map((rate) => toDisplayedTypingSpeed(
                  session.language === "en" ? rate : null,
                  session.language === "ko" ? rate : null,
                  session.language,
                  typingSpeedUnits[session.language],
                )),
                session.lineScores.length,
              );
              const speedUnit = typingSpeedUnits[session.language];
              const average = statistics.mean === null ? "—" : copy.speedValue(Math.round(statistics.mean), speedUnit, session.language);
              const median = statistics.median === null ? "—" : copy.speedValue(Math.round(statistics.median), speedUnit, session.language);
              const accuracy = sessionAccuracy(session);
              return (
                <li key={session.id}>
                  <div>
                    <strong>{copy.modeLabel(session.mode)}</strong> · {session.language === "ko" ? copy.korean : copy.english}
                    {` · ${session.completion === "completed" ? copy.sessionCompleted : copy.sessionEndedEarly}`}
                  </div>
                  <span>{dateFormat.format(session.completedAt)}</span>
                  <div>
                    {accuracy === null ? "—" : copy.accuracyValue(Math.round(accuracy))}
                    {` · ${copy.sessionSamples(statistics.sampleCount)} · ${copy.mean}: ${average} · ${copy.median}: ${median}`}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {visible.length === 0 && visibleSessions.length === 0 && highScores.length === 0 && <p className="lede">{copy.noRecords}</p>}
      {visible.length > 0 && (
        <ul className="history-list practice-record-list">
          {visible.map(({ id, mode, language, completedAt, score }) => {
            const speedUnit = typingSpeedUnits[language];
            const speed = toDisplayedTypingSpeed(
              score.charactersPerMinute,
              score.keystrokesPerMinute,
              language,
              speedUnit,
            );
            return (
              <li key={id}>
                <div><strong>{copy.modeLabel(mode)}</strong> · {language === "ko" ? copy.korean : copy.english}</div>
                <span>{dateFormat.format(completedAt)}</span>
                <div>
                  {score.accuracy === null ? "—" : copy.accuracyValue(Math.round(score.accuracy))}
                  {speed !== null && ` · ${copy.speedValue(Math.round(speed), speedUnit, language)}`}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </section>
  );
}
