export type TypingRateStatistics = Readonly<{
  sampleCount: number;
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
 * Summarize one rate per completed lesson. Quartiles use the median of each
 * half, excluding the overall median for odd-sized samples.
 */
export function summarizeTypingRates(values: readonly (number | null)[]): TypingRateStatistics {
  const sortedValues = values
    .filter((value): value is number => value !== null && Number.isFinite(value))
    .sort((left, right) => left - right);
  const sampleCount = sortedValues.length;
  if (sampleCount === 0) {
    return {
      sampleCount,
      mean: null,
      populationStandardDeviation: null,
      median: null,
      lowerQuartile: null,
      upperQuartile: null,
      interquartileRange: null,
    };
  }

  const mean = sortedValues.reduce((total, value) => total + value, 0) / sampleCount;
  const variance = sortedValues.reduce((total, value) => total + (value - mean) ** 2, 0) / sampleCount;
  const middle = Math.floor(sampleCount / 2);
  const lowerHalf = sampleCount === 1 ? sortedValues : sortedValues.slice(0, middle);
  const upperHalf = sampleCount === 1 ? sortedValues : sortedValues.slice(Math.ceil(sampleCount / 2));
  const lowerQuartile = median(lowerHalf);
  const upperQuartile = median(upperHalf);

  return {
    sampleCount,
    mean,
    populationStandardDeviation: Math.sqrt(variance),
    median: median(sortedValues),
    lowerQuartile,
    upperQuartile,
    interquartileRange: lowerQuartile === null || upperQuartile === null
      ? null
      : upperQuartile - lowerQuartile,
  };
}
