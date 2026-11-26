import { describe, expect, it } from "vitest";
import { summarizeTypingRates } from "./typingStatistics";

describe("typing rate statistics", () => {
  it("drops the fastest and slowest rates in sessions of twenty lines or fewer", () => {
    const statistics = summarizeTypingRates([10, 20, 30, 40]);
    expect(statistics).toMatchObject({
      sampleCount: 4,
      includedSampleCount: 2,
      median: 25,
      lowerQuartile: 20,
      upperQuartile: 30,
      interquartileRange: 10,
    });
    expect(statistics.mean).toBeCloseTo(25);
    expect(statistics.populationStandardDeviation).toBeCloseTo(5);
  });

  it("excludes the middle value from quartile halves after short-session trimming", () => {
    expect(summarizeTypingRates([50, 10, 40, 20, 30])).toEqual({
      sampleCount: 5,
      includedSampleCount: 3,
      mean: 30,
      populationStandardDeviation: Math.sqrt(200 / 3),
      median: 30,
      lowerQuartile: 20,
      upperQuartile: 40,
      interquartileRange: 20,
    });
  });

  it("trims five percent from each tail for sessions longer than twenty lines", () => {
    const statistics = summarizeTypingRates(Array.from({ length: 40 }, (_, index) => index + 1));

    expect(statistics).toMatchObject({
      sampleCount: 40,
      includedSampleCount: 36,
      median: 20.5,
      lowerQuartile: 11.5,
      upperQuartile: 29.5,
    });
    expect(statistics.mean).toBeCloseTo(20.5);
  });

  it("ignores missing and non-finite speeds and returns empty statistics when none remain", () => {
    expect(summarizeTypingRates([10, null, 30, Number.NaN])).toMatchObject({
      sampleCount: 2,
      includedSampleCount: 2,
      mean: 20,
      median: 20,
      lowerQuartile: 10,
      upperQuartile: 30,
      interquartileRange: 20,
    });
    expect(summarizeTypingRates([null, Number.POSITIVE_INFINITY])).toMatchObject({
      sampleCount: 0,
      includedSampleCount: 0,
      mean: null,
      populationStandardDeviation: null,
      median: null,
      lowerQuartile: null,
      upperQuartile: null,
      interquartileRange: null,
    });
  });

  it("keeps a single completed lesson useful for early session exit", () => {
    expect(summarizeTypingRates([85])).toMatchObject({
      sampleCount: 1,
      includedSampleCount: 1,
      mean: 85,
      populationStandardDeviation: 0,
      median: 85,
      lowerQuartile: 85,
      upperQuartile: 85,
      interquartileRange: 0,
    });
  });

  it("summarizes very large finite rates without overflowing the mean or deviation", () => {
    expect(summarizeTypingRates([Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE])).toMatchObject({
      sampleCount: 3,
      includedSampleCount: 1,
      mean: Number.MAX_VALUE,
      populationStandardDeviation: 0,
      median: Number.MAX_VALUE,
    });
    expect(summarizeTypingRates([Number.MAX_VALUE, Number.MAX_VALUE], 40).median).toBe(Number.MAX_VALUE);
  });
});
