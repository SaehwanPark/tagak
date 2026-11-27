import type { Language } from "../content/lessons";
import type { TypingScore } from "./typing";
import type { LinePracticeSessionLength } from "./linePracticeSettings";

export type RecordedMode = "position" | "word" | "line" | "short" | "long";

export type PracticeRecord = {
  id: string;
  materialId: string;
  completedAt: number;
  mode: RecordedMode;
  language: Language;
  score: TypingScore;
};

export type PracticeSessionRecord = {
  id: string;
  completedAt: number;
  mode: Extract<RecordedMode, "line" | "short" | "long">;
  language: Language;
  materialIds: readonly string[];
  lineSessionLength: LinePracticeSessionLength | null;
  completion: "completed" | "early-exit";
  lineScores: readonly TypingScore[];
};

export type PracticeHighScore = {
  rulesVersion: 1;
  scopeKey: string;
  sessionId: string;
  completedAt: number;
  mode: PracticeSessionRecord["mode"];
  language: Language;
  lineSessionLength: LinePracticeSessionLength | null;
  rawRates: readonly number[];
  median: number;
};

export const recordLimit = 100;
export const modeLabels: Record<RecordedMode, string> = {
  position: "자리 연습",
  word: "낱말",
  line: "한 줄",
  short: "짧은 글",
  long: "긴 글",
};

export function recentRecords(records: readonly PracticeRecord[]): PracticeRecord[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return Array.from(byId.values())
    .sort((left, right) => right.completedAt - left.completedAt || left.id.localeCompare(right.id))
    .slice(0, recordLimit);
}

export function recentPassageMaterialId(
  sessions: readonly PracticeSessionRecord[],
  mode: Extract<PracticeSessionRecord["mode"], "short" | "long">,
  language: Language,
): string | null {
  const latest = sessions
    .filter((session) => session.mode === mode && session.language === language)
    .sort((left, right) => right.completedAt - left.completedAt || left.id.localeCompare(right.id))[0];
  return latest?.materialIds[0] ?? null;
}

export function comparableRecord(
  current: PracticeRecord,
  records: readonly PracticeRecord[],
): PracticeRecord | undefined {
  return records.find((record) =>
    record.id !== current.id &&
    record.completedAt <= current.completedAt &&
    record.mode === current.mode &&
    record.language === current.language
  );
}
