export const linePracticeSessionLengths = [5, 10, 20, 30, 50, 75, 100] as const;

export type LinePracticeSessionLength = typeof linePracticeSessionLengths[number];

export const defaultLinePracticeSessionLength: LinePracticeSessionLength = 20;

export function isLinePracticeSessionLength(value: unknown): value is LinePracticeSessionLength {
  return linePracticeSessionLengths.some((length) => length === value);
}
