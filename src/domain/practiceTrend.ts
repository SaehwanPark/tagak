import type { Language } from "../content/lessons";
import type { PracticeSessionRecord } from "./history";
import type { LinePracticeSessionLength } from "./linePracticeSettings";
import { highScoreScopeKey, sessionStatistics } from "./sessionHighScore";

export const trendDisplaySessionCount = 12;
export const trendRecentAverageCount = 5;
export const trendMinimumComparableSessions = 3;

export type PracticeTrendPoint = Readonly<{
  sessionId: string;
  completedAt: number;
  rate: number;
}>;

export type PracticeTrendGroup = Readonly<{
  key: string;
  mode: PracticeSessionRecord["mode"];
  language: Language;
  lineSessionLength: LinePracticeSessionLength | null;
  points: readonly PracticeTrendPoint[];
  sessionCount: number;
  recentAverage: number;
  minimumSessions: number;
}>;

type GroupAccumulator = {
  mode: PracticeSessionRecord["mode"];
  language: Language;
  lineSessionLength: LinePracticeSessionLength | null;
  points: PracticeTrendPoint[];
};

function mean(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * A trend compares only completed sessions with usable speed samples in the
 * same mode, practice language, and one-line session length. The caller passes
 * the recent session list, so older records beyond the history limit never
 * affect the chart.
 */
export function buildPracticeTrend(
  sessions: readonly PracticeSessionRecord[],
): PracticeTrendGroup[] {
  const groups = new Map<string, GroupAccumulator>();
  const ordered = [...sessions].sort(
    (left, right) => left.completedAt - right.completedAt || left.id.localeCompare(right.id),
  );

  for (const session of ordered) {
    if (session.completion !== "completed") continue;
    if (session.mode === "line" && session.lineSessionLength === null) continue;
    const statistics = sessionStatistics(session);
    if (statistics.mean === null || !Number.isFinite(statistics.mean) || statistics.mean <= 0) continue;
    const key = highScoreScopeKey(session.mode, session.language, session.lineSessionLength);
    const group = groups.get(key) ?? {
      mode: session.mode,
      language: session.language,
      lineSessionLength: session.lineSessionLength,
      points: [],
    };
    group.points.push({ sessionId: session.id, completedAt: session.completedAt, rate: statistics.mean });
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([key, group]): PracticeTrendGroup => {
      const recentRates = group.points
        .slice(-trendRecentAverageCount)
        .map((point) => point.rate);
      return {
        key,
        mode: group.mode,
        language: group.language,
        lineSessionLength: group.lineSessionLength,
        points: group.points.slice(-trendDisplaySessionCount),
        sessionCount: group.points.length,
        recentAverage: mean(recentRates),
        minimumSessions: trendMinimumComparableSessions,
      };
    })
    .sort((left, right) => {
      const leftLatest = left.points.at(-1)?.completedAt ?? 0;
      const rightLatest = right.points.at(-1)?.completedAt ?? 0;
      return rightLatest - leftLatest || left.key.localeCompare(right.key);
    });
}
