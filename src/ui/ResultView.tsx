import type { TypingScore } from "../domain/typing";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import { toDisplayedTypingSpeed } from "../domain/typingSpeed";
import { summarizeTypingRates } from "../domain/typingStatistics";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import type { PracticeSessionRecord } from "../domain/history";
import type { HighScoreDecision } from "../domain/sessionHighScore";
import { Scoreboard } from "./Scoreboard";
import { useFocus } from "./useFocus";
import { handleScrollRegionKeyDown } from "./focusWithinScrollRegion";

type ResultViewProps = {
  title: string;
  progress?: string | undefined;
  score: TypingScore;
  lineSessionScores?: readonly TypingScore[];
  sessionRecord?: PracticeSessionRecord | null;
  sessionDecision?: HighScoreDecision | null;
  sessionSaveFailed?: boolean;
  showSpeed: boolean;
  comparison?: TypingScore | undefined;
  language: Language;
  speedUnit: TypingSpeedUnit;
  backLabel?: string;
  onRetry: () => void;
  onBack: () => void;
  copy: InterfaceText;
};

export function ResultView({
  title, progress, score, lineSessionScores, sessionRecord, sessionDecision, sessionSaveFailed = false,
  showSpeed, comparison, language, speedUnit, backLabel, onRetry, onBack, copy,
}: ResultViewProps) {
  const heading = useFocus<HTMLHeadingElement>();
  const destination = backLabel ?? copy.menu;
  const sessionStatistics = lineSessionScores === undefined
    ? null
    : summarizeTypingRates(lineSessionScores.map((item) =>
      toDisplayedTypingSpeed(item.charactersPerMinute, item.keystrokesPerMinute, language, speedUnit)), lineSessionScores.length);
  const formattedStatistic = (value: number | null) => value === null ? "—" : String(Math.round(value));
  const formattedQuartileRange = () => sessionStatistics?.lowerQuartile === null ||
    sessionStatistics?.upperQuartile === null || !sessionStatistics
    ? "—"
    : `${formattedStatistic(sessionStatistics.lowerQuartile)}–${formattedStatistic(sessionStatistics.upperQuartile)}`;
  const displayRawRate = (value: number) => toDisplayedTypingSpeed(
    language === "en" ? value : null,
    language === "ko" ? value : null,
    language,
    speedUnit,
  );
  const formatImprovement = (improvement: number) => String(Number((improvement * 100).toFixed(4)));
  const formatPValue = (pValue: number) => pValue.toFixed(3);
  const highScoreMessage = (() => {
    if (!sessionRecord) return null;
    if (sessionSaveFailed) return copy.sessionSaveFailed;
    if (!sessionDecision) return null;
    switch (sessionDecision.status) {
      case "already-saved": return null;
      case "first-record": return copy.highScoreFirstRecord;
      case "new-record": {
        const current = displayRawRate(sessionDecision.median);
        const previous = displayRawRate(sessionDecision.previousMedian);
        return current === null || previous === null ? null : copy.highScoreUpdated(
          Math.round(current), Math.round(previous), formatImprovement(sessionDecision.improvement),
        );
      }
      case "kept": {
        const current = displayRawRate(sessionDecision.median);
        const previous = displayRawRate(sessionDecision.previousMedian);
        if (current === null || previous === null) return null;
        const improvement = formatImprovement(sessionDecision.improvement);
        const pValue = formatPValue(sessionDecision.pValue);
        const reason = sessionDecision.reason === "below-improvement"
          ? copy.highScoreBelowThreshold(improvement)
          : sessionDecision.reason === "not-significant"
            ? copy.highScoreNotSignificant(improvement, pValue)
            : copy.highScoreBothFailed(improvement, pValue);
        return `${copy.highScoreKept(Math.round(current), Math.round(previous))}. ${reason}`;
      }
      case "ineligible":
        switch (sessionDecision.reason) {
          case "early-exit": return copy.highScoreIncompleteReason;
          case "accuracy": return copy.highScoreAccuracyReason;
          case "samples": return copy.highScoreSamplesReason(5);
          case "invalid-rate": return copy.highScoreInvalidRateReason;
        }
    }
  })();

  return (
    <section className="screen result-screen" onKeyDown={(event) => {
      if (event.nativeEvent.isComposing || event.repeat) return;
      if (event.key === "Escape") onBack();
      if (event.key === "Enter" && event.target === heading.current) onRetry();
    }}>
      <h1 ref={heading} tabIndex={-1} aria-describedby="result-title result-hint">{copy.practiceComplete}</h1>
      <p id="result-title" className="lede">{title}</p>
      {progress && <p className="result-progress">{progress}</p>}
      <div
        className="result-details"
        role="region"
        aria-label={title}
        tabIndex={0}
        data-scroll-region
        onKeyDown={handleScrollRegionKeyDown}
      >
        {highScoreMessage && <p className="high-score-status" role="status">{highScoreMessage}</p>}
        {sessionStatistics && (
          <section className="previous-score line-session-statistics" aria-labelledby="line-session-statistics-title">
            <h2 id="line-session-statistics-title">{copy.lineSessionStatistics} · {copy.speedLabel(speedUnit, language)}</h2>
            <p className="result-progress">{copy.lineSessionSampleCount(sessionStatistics.includedSampleCount, sessionStatistics.sampleCount)}</p>
            <dl className="scores">
              <div><dt>{copy.mean}</dt><dd>{formattedStatistic(sessionStatistics.mean)}</dd></div>
              <div><dt>{copy.standardDeviation}</dt><dd>{formattedStatistic(sessionStatistics.populationStandardDeviation)}</dd></div>
              <div><dt>{copy.median}</dt><dd>{formattedStatistic(sessionStatistics.median)}</dd></div>
              <div><dt>{copy.interquartileRange}</dt><dd>{formattedQuartileRange()}</dd></div>
            </dl>
          </section>
        )}
        <Scoreboard score={score} label={copy.thisResult} showSpeed={showSpeed} language={language} speedUnit={speedUnit} showTime copy={copy} />
        {comparison && (
          <section className="previous-score" aria-labelledby="comparison-title">
            <h2 id="comparison-title">{copy.sameModePrevious}</h2>
            <Scoreboard score={comparison} label={copy.previousResult} showSpeed={showSpeed} language={language} speedUnit={speedUnit} showTime copy={copy} />
          </section>
        )}
      </div>
      <div className="result-actions">
        <button type="button" className="button" onClick={onRetry}>{copy.practiceAgain}</button>
        <button type="button" className="button secondary" onClick={onBack}>{copy.returnTo(destination)}</button>
      </div>
      <p className="keys" id="result-hint">
        <kbd>Enter</kbd> {copy.practiceAgain}
        {" "}<kbd>Esc</kbd> {destination}
      </p>
    </section>
  );
}
