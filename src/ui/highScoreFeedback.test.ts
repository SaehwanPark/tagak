import { describe, expect, it } from "vitest";
import { interfaceText } from "../content/interfaceText";
import type { PracticeSessionRecord } from "../domain/history";
import type { TypingScore } from "../domain/typing";
import { buildHighScoreFeedback } from "./highScoreFeedback";

function score(rate: number | null, correctCount = 100, typedCount = 100): TypingScore {
  return {
    accuracy: typedCount === 0 ? null : (correctCount * 100) / typedCount,
    correctCount,
    typedCount,
    elapsedMs: 60_000,
    charactersPerMinute: null,
    keystrokeCount: 100,
    keystrokesPerMinute: rate,
  };
}

function session(rates: readonly (number | null)[], options: Partial<PracticeSessionRecord> = {}): PracticeSessionRecord {
  return {
    id: "session",
    completedAt: 1,
    mode: "line",
    language: "ko",
    materialIds: rates.map((_, index) => `line-${index}`),
    lineSessionLength: rates.length as 5 | 10 | 20 | 30 | 50 | 75 | 100,
    completion: "completed",
    lineScores: rates.map((rate) => score(rate)),
    ...options,
  };
}

describe("high-score result feedback", () => {
  it("shows the first median in the selected unit and exposes the rules in details", () => {
    const result = buildHighScoreFeedback(
      session([100.2, 101, 102, 103, 103.8]),
      { status: "first-record", median: 102 },
      "wpm",
      interfaceText("en"),
    );

    expect(result?.message).toBe("First high score! Median: 20.4 Words/min.");
    expect(result?.details?.rules).toContain("one-sided Mann–Whitney");
    expect(result?.details?.rules).toContain("not scientific proof of a skill increase");
  });

  it("shows a negative change as a decrease without calling it improvement", () => {
    const result = buildHighScoreFeedback(
      session([99, 99, 99, 99, 99]),
      {
        status: "kept",
        reason: "below-improvement",
        median: 99,
        previousMedian: 100,
        improvement: -0.01,
        pValue: 1,
      },
      "cpm",
      interfaceText("ko"),
    );

    expect(result?.message).toContain("변화 -1%");
    expect(result?.message).toContain("갱신 기준 +0.3%에 미달");
    expect(result?.message).not.toContain("향상");
    expect(result?.details?.comparison).toContain("p=1.000");
  });

  it("identifies a positive median change that still misses the sample comparison", () => {
    const result = buildHighScoreFeedback(
      session([104, 104, 104, 104, 104]),
      {
        status: "kept",
        reason: "not-significant",
        median: 104,
        previousMedian: 100,
        improvement: 0.04,
        pValue: 0.07,
      },
      "cpm",
      interfaceText("en"),
    );

    expect(result?.message).toContain("change +4%");
    expect(result?.message).toContain("median is +4% higher");
    expect(result?.details?.comparison).toContain("p=0.070");
    expect(result?.message).not.toContain("new high score");
  });

  it("reports the actual accuracy and available valid samples for ineligible sessions", () => {
    const lowAccuracy = buildHighScoreFeedback(
      session([120, 121, 122, 123, 124], {
        lineScores: [120, 121, 122, 123, 124].map((rate) => score(rate, 96, 100)),
      }),
      { status: "ineligible", reason: "accuracy" },
      "cpm",
      interfaceText("ko"),
    );
    const fewSamples = buildHighScoreFeedback(
      session([120, 121, null, null, null]),
      { status: "ineligible", reason: "samples" },
      "cpm",
      interfaceText("ko"),
    );

    expect(lowAccuracy?.message).toContain("세션 정확도 96%가 최고 기록 기준 97%에 미달");
    expect(fewSamples?.message).toContain("유효한 속도 표본 2개");
    expect(fewSamples?.message).toContain("필요한 5개");
  });

  it("does not round a below-threshold accuracy up to the qualifying value", () => {
    const lowAccuracy = buildHighScoreFeedback(
      session([120, 121, 122, 123, 124], {
        lineScores: [120, 121, 122, 123, 124].map((rate) => score(rate, 96_999, 100_000)),
      }),
      { status: "ineligible", reason: "accuracy" },
      "cpm",
      interfaceText("en"),
    );

    expect(lowAccuracy?.message).toContain("Session accuracy 96.99% is below the 97% high-score requirement");
  });

  it("explains why an early-exit session cannot update the high score", () => {
    const result = buildHighScoreFeedback(
      session([120, 121, 122, 123, 124], { completion: "early-exit" }),
      { status: "ineligible", reason: "early-exit" },
      "cpm",
      interfaceText("ko"),
    );

    expect(result?.message).toContain("끝까지 완료하지 않아 최고 기록을 갱신하지 않았습니다");
  });

  it("keeps success text, relative change, and the p value aligned", () => {
    const result = buildHighScoreFeedback(
      session([103.1, 103.1, 103.1, 103.1, 103.1]),
      {
        status: "new-record",
        median: 103.1,
        previousMedian: 100,
        improvement: 0.031,
        pValue: 0.04996,
      },
      "cpm",
      interfaceText("ko"),
    );

    expect(result?.message).toContain("이번 103.1 타수/분 · 기존 100 타수/분 · 변화 +3.1%");
    expect(result?.details?.comparison).toContain("p<0.05");
  });
});
