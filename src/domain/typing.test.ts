import { describe, expect, it } from "vitest";
import {
  calculateTypingScore,
  countKoreanKeystrokes,
  createPracticeSession,
  hasReachedEnd,
  insertSpaceAtSelection,
  normalizeInput,
  reducePracticeSession,
  setPracticeSessionPause,
  splitCharacters,
} from "./typing";

describe("Korean text input", () => {
  it("compares precomposed and decomposed Hangul as the same grapheme", () => {
    expect(normalizeInput("한")).toBe("한");
    expect(splitCharacters("한")).toEqual(["한"]);
  });

  it("keeps punctuation and spaces as typed characters", () => {
    expect(splitCharacters("한글, 한 줄!")).toHaveLength(8);
  });

  it("counts Korean two-set keyboard strokes rather than completed syllables", () => {
    expect(countKoreanKeystrokes("한")).toBe(3);
    expect(countKoreanKeystrokes("까")).toBe(2);
    expect(countKoreanKeystrokes("ㄲㄸㅃㅆㅉ")).toBe(5);
    expect(countKoreanKeystrokes("과")).toBe(3);
    expect(countKoreanKeystrokes("값")).toBe(4);
    expect(countKoreanKeystrokes("ㄲㅘㄳ")).toBe(5);
    expect(countKoreanKeystrokes("한글, ")).toBe(8);
  });
});

describe("practice sessions", () => {
  it("starts its timer with the first confirmed input", () => {
    const empty = createPracticeSession();

    expect(
      reducePracticeSession(empty, {
        type: "input-changed",
        input: "",
        at: 100,
      }).startedAt,
    ).toBeNull();
    expect(
      reducePracticeSession(empty, {
        type: "input-changed",
        input: "한",
        at: 200,
      }).startedAt,
    ).toBe(200);
  });

  it("allows mistakes to be corrected before the final score", () => {
    const typed = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "한클",
      at: 1_000,
    });
    const corrected = reducePracticeSession(typed, {
      type: "input-changed",
      input: "한글",
      at: 4_000,
    });

    expect(calculateTypingScore("한글", corrected, 5_000, "ko")).toMatchObject({
      accuracy: 100,
      correctCount: 2,
      typedCount: 2,
      elapsedMs: 4_000,
      charactersPerMinute: null,
      keystrokeCount: 6,
      keystrokesPerMinute: 90,
    });
  });

  it("scores errors and extra characters by target position", () => {
    const session = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "한클!",
      at: 100,
    });

    expect(calculateTypingScore("한글", session, 1_100, "ko")).toMatchObject({
      accuracy: 100 / 3,
      correctCount: 1,
      typedCount: 3,
      charactersPerMinute: null,
      keystrokeCount: 7,
      keystrokesPerMinute: 420,
    });
  });

  it("hides speed until the session lasts one second", () => {
    const session = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "한",
      at: 1_000,
    });

    expect(calculateTypingScore("한글", session, 1_999, "ko").keystrokesPerMinute).toBeNull();
    expect(calculateTypingScore("한글", session, 2_000, "ko").keystrokesPerMinute).toBe(180);
  });

  it("keeps English speed based on correct characters", () => {
    const session = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "hellx",
      at: 1_000,
    });
    expect(calculateTypingScore("hello", session, 2_000, "en")).toMatchObject({
      correctCount: 4,
      typedCount: 5,
      charactersPerMinute: 240,
      keystrokeCount: null,
      keystrokesPerMinute: null,
    });
  });

  it("subtracts overlapping settings and inactive time but retains idle thinking time", () => {
    const typed = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "hello",
      at: 1_000,
    });
    const settingsPaused = setPracticeSessionPause(typed, "settings", true, 2_000);
    const bothPaused = setPracticeSessionPause(settingsPaused, "app-inactive", true, 3_000);
    const appReturned = setPracticeSessionPause(bothPaused, "app-inactive", false, 12_000);
    const resumed = setPracticeSessionPause(appReturned, "settings", false, 14_000);

    expect(setPracticeSessionPause(resumed, "settings", false, 15_000)).toBe(resumed);
    expect(calculateTypingScore("hello", resumed, 17_000, "en").elapsedMs).toBe(4_000);
  });

  it("clamps an out-of-order resume to the pause start", () => {
    const typed = reducePracticeSession(createPracticeSession(), {
      type: "input-changed",
      input: "hello",
      at: 1_000,
    });
    const paused = setPracticeSessionPause(typed, "app-inactive", true, 2_000);
    const resumed = setPracticeSessionPause(paused, "app-inactive", false, 1_500);

    expect(calculateTypingScore("hello", resumed, 4_000, "en").elapsedMs).toBe(3_000);
  });

  it("does not finish before all target graphemes are typed", () => {
    expect(hasReachedEnd("한글!", "한글")).toBe(false);
    expect(hasReachedEnd("한글!", "한글!")).toBe(true);
  });

  it("inserts one space at the selection and returns the next caret position", () => {
    expect(insertSpaceAtSelection("학교에가다", 3, 3)).toEqual({
      input: "학교에 가다",
      caret: 4,
    });
    expect(insertSpaceAtSelection("abc", 1, 2)).toEqual({
      input: "a c",
      caret: 2,
    });
  });

  it("keeps a completed session unchanged", () => {
    const session = reducePracticeSession(
      {
        input: "한글",
        startedAt: 1_000,
        completedAt: null,
        excludedDurationMs: 0,
        pausedAt: null,
        pauseReasons: [],
      },
      { type: "submitted", at: 4_000 },
    );

    expect(
      reducePracticeSession(session, {
        type: "input-changed",
        input: "다른 입력",
        at: 5_000,
      }),
    ).toBe(session);
  });
});
