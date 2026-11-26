import type { InterfaceText } from "../content/interfaceText";
import type { PracticeSessionRecord } from "../domain/history";
import {
  highScoreMinimumAccuracy,
  highScoreMinimumImprovement,
  highScoreMinimumSamples,
  highScoreSignificanceLevel,
  sessionAccuracy,
  sessionSpeedSamples,
} from "../domain/sessionHighScore";
import type { HighScoreDecision } from "../domain/sessionHighScore";
import type { Language } from "../content/lessons";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import { toDisplayedTypingSpeed } from "../domain/typingSpeed";

export type HighScoreFeedback = Readonly<{
  message: string;
  details: Readonly<{
    title: string;
    rules: string;
    comparison?: string;
  }> | null;
}>;

function displayRawRate(value: number, language: Language, speedUnit: TypingSpeedUnit): number | null {
  return toDisplayedTypingSpeed(
    language === "en" ? value : null,
    language === "ko" ? value : null,
    language,
    speedUnit,
  );
}

function formatSpeedRate(value: number): string {
  return String(Number(value.toFixed(1)));
}

function formatChangePercent(improvement: number): string {
  const rounded = Number((improvement * 100).toFixed(2));
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

function formatPValue(value: number): string {
  if (value < 0.001) return "<0.001";
  const rounded = Number(value.toFixed(3));
  return value < 0.05 && rounded >= 0.05 ? "<0.05" : rounded.toFixed(3);
}

function formatThreshold(value: number): string {
  return String(Number((value * 100).toFixed(2)));
}

function formatBelowThresholdAccuracy(value: number, minimumAccuracy: number): string {
  const rounded = Number(value.toFixed(2));
  if (value < minimumAccuracy && rounded >= minimumAccuracy) {
    return String(Number((minimumAccuracy - 0.01).toFixed(2)));
  }
  return String(rounded);
}

function rulesDetails(copy: InterfaceText, comparison?: string): HighScoreFeedback["details"] {
  return {
    title: copy.highScoreExplanationTitle,
    rules: copy.highScoreRulesExplanation(
      highScoreMinimumAccuracy,
      highScoreMinimumSamples,
      formatThreshold(highScoreMinimumImprovement),
      String(highScoreSignificanceLevel),
    ),
    ...(comparison === undefined ? {} : { comparison }),
  };
}

export function buildHighScoreFeedback(
  session: PracticeSessionRecord,
  decision: HighScoreDecision,
  speedUnit: TypingSpeedUnit,
  copy: InterfaceText,
): HighScoreFeedback | null {
  const unitLabel = copy.speedLabel(speedUnit, session.language);
  switch (decision.status) {
    case "already-saved":
      return null;
    case "first-record": {
      const median = displayRawRate(decision.median, session.language, speedUnit);
      if (median === null) return null;
      return {
        message: copy.highScoreFirstRecord(formatSpeedRate(median), unitLabel),
        details: rulesDetails(copy),
      };
    }
    case "new-record": {
      const current = displayRawRate(decision.median, session.language, speedUnit);
      const previous = displayRawRate(decision.previousMedian, session.language, speedUnit);
      if (current === null || previous === null) return null;
      const changePercent = formatChangePercent(decision.improvement);
      return {
        message: copy.highScoreUpdated(
          formatSpeedRate(current),
          formatSpeedRate(previous),
          unitLabel,
          changePercent,
        ),
        details: rulesDetails(copy, copy.highScoreComparisonDetails(
          changePercent,
          formatPValue(decision.pValue),
          formatThreshold(highScoreMinimumImprovement),
          String(highScoreSignificanceLevel),
        )),
      };
    }
    case "kept": {
      const current = displayRawRate(decision.median, session.language, speedUnit);
      const previous = displayRawRate(decision.previousMedian, session.language, speedUnit);
      if (current === null || previous === null) return null;
      const changePercent = formatChangePercent(decision.improvement);
      const reason = decision.reason === "below-improvement"
        ? copy.highScoreBelowThreshold(changePercent, formatThreshold(highScoreMinimumImprovement))
        : decision.reason === "not-significant"
          ? copy.highScoreNotSignificant(changePercent)
          : copy.highScoreBothFailed(changePercent);
      return {
        message: `${copy.highScoreKept(
          formatSpeedRate(current),
          formatSpeedRate(previous),
          unitLabel,
          changePercent,
        )}. ${reason}`,
        details: rulesDetails(copy, copy.highScoreComparisonDetails(
          changePercent,
          formatPValue(decision.pValue),
          formatThreshold(highScoreMinimumImprovement),
          String(highScoreSignificanceLevel),
        )),
      };
    }
    case "ineligible":
      switch (decision.reason) {
        case "early-exit":
          return { message: copy.highScoreIncompleteReason, details: null };
        case "accuracy": {
          const accuracy = sessionAccuracy(session);
          return {
            message: copy.highScoreAccuracyReason(
              accuracy === null ? null : formatBelowThresholdAccuracy(accuracy, highScoreMinimumAccuracy),
              highScoreMinimumAccuracy,
            ),
            details: null,
          };
        }
        case "samples":
          return {
            message: copy.highScoreSamplesReason(sessionSpeedSamples(session).length, highScoreMinimumSamples),
            details: null,
          };
        case "invalid-rate":
          return { message: copy.highScoreInvalidRateReason, details: null };
      }
  }
}
