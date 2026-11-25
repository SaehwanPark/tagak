export type TypingRateStatistics = Readonly<{
  sampleCount: number;
  includedSampleCount: number;
  mean: number | null;
  populationStandardDeviation: number | null;
  median: number | null;
  lowerQuartile: number | null;
  upperQuartile: number | null;
  interquartileRange: number | null;
}>;

function median(sortedValues: readonly number[]): number | null {
  if (sortedValues.length === 0) return null;
  const middle = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 === 0
    ? ((sortedValues[middle - 1] ?? 0) + (sortedValues[middle] ?? 0)) / 2
    : sortedValues[middle] ?? null;
}

/**
 * Summarize valid lesson rates after dropping session outliers. Quartiles use
 * the median of each half, excluding the overall median for odd-sized samples.
 */
export function summarizeTypingRates(
  values: readonly (number | null)[],
  completedLessonCount = values.length,
): TypingRateStatistics {
  const sortedValues = values
    .filter((value): value is number => value !== null && Number.isFinite(value))
    .sort((left, right) => left - right);
  const sampleCount = sortedValues.length;
  const includedValues = trimOutlierRates(sortedValues, completedLessonCount);
  const includedSampleCount = includedValues.length;
  if (sampleCount === 0) {
    return {
      sampleCount,
      includedSampleCount,
      mean: null,
      populationStandardDeviation: null,
      median: null,
      lowerQuartile: null,
      upperQuartile: null,
      interquartileRange: null,
    };
  }

  const mean = includedValues.reduce((total, value) => total + value, 0) / includedSampleCount;
  const variance = includedValues.reduce((total, value) => total + (value - mean) ** 2, 0) / includedSampleCount;
  const middle = Math.floor(includedSampleCount / 2);
  const lowerHalf = includedSampleCount === 1 ? includedValues : includedValues.slice(0, middle);
  const upperHalf = includedSampleCount === 1 ? includedValues : includedValues.slice(Math.ceil(includedSampleCount / 2));
  const lowerQuartile = median(lowerHalf);
  const upperQuartile = median(upperHalf);

  return {
    sampleCount,
    includedSampleCount,
    mean,
    populationStandardDeviation: Math.sqrt(variance),
    median: median(includedValues),
    lowerQuartile,
    upperQuartile,
    interquartileRange: lowerQuartile === null || upperQuartile === null
      ? null
      : upperQuartile - lowerQuartile,
  };
}

function trimOutlierRates(sortedValues: readonly number[], completedLessonCount: number): readonly number[] {
  if (completedLessonCount <= 20) {
    return sortedValues.length >= 3 ? sortedValues.slice(1, -1) : sortedValues;
  }

  const tailCount = Math.floor(sortedValues.length * 0.05);
  return tailCount > 0 ? sortedValues.slice(tailCount, -tailCount) : sortedValues;
}
