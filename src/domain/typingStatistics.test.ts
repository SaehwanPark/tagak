import { describe, expect, it } from "vitest";
import { summarizeTypingRates } from "./typingStatistics";

describe("typing rate statistics", () => {
  it("summarizes an even sample with population deviation and median-of-halves quartiles", () => {
    expect(summarizeTypingRates([10, 20, 30, 40])).toEqual({
      sampleCount: 4,
      mean: 25,
      populationStandardDeviation: Math.sqrt(125),
      median: 25,
      lowerQuartile: 15,
      upperQuartile: 35,
      interquartileRange: 20,
    });
  });

  it("excludes the middle value from both halves for an odd sample", () => {
    expect(summarizeTypingRates([50, 10, 40, 20, 30])).toEqual({
      sampleCount: 5,
      mean: 30,
      populationStandardDeviation: Math.sqrt(200),
      median: 30,
      lowerQuartile: 15,
      upperQuartile: 45,
      interquartileRange: 30,
    });
  });

  it("ignores missing and non-finite speeds and returns empty statistics when none remain", () => {
    expect(summarizeTypingRates([10, null, 30, Number.NaN])).toMatchObject({
      sampleCount: 2,
      mean: 20,
      median: 20,
      lowerQuartile: 10,
      upperQuartile: 30,
      interquartileRange: 20,
    });
    expect(summarizeTypingRates([null, Number.POSITIVE_INFINITY])).toMatchObject({
      sampleCount: 0,
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
      mean: 85,
      populationStandardDeviation: 0,
      median: 85,
      lowerQuartile: 85,
      upperQuartile: 85,
      interquartileRange: 0,
    });
  });
});
