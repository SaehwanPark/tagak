import { expect, it } from "vitest";
import { advanceChallenge, challengeElapsedMs, targetWord } from "./challenge";

const words = ["바람", "새벽", "물결", "연필"] as const;

it("counts only exact matches submitted before the deadline", () => {
  const start = advanceChallenge(words, { phase: "ready" }, { type: "start", at: 1_000, seed: 0x12345678 });
  if (start.phase !== "running") throw new Error("Expected a running challenge.");
  const firstWord = targetWord(start.words, 0);
  const typo = advanceChallenge(words, start, { type: "input", input: `${firstWord}!`, at: 2_000 });
  const miss = advanceChallenge(words, typo, { type: "submit", at: 2_100 });
  expect(miss).toMatchObject({ phase: "running", solved: 0, missed: true });

  const input = advanceChallenge(words, miss, { type: "input", input: firstWord.normalize("NFD"), at: 4_000 });
  expect(advanceChallenge(words, input, { type: "submit", at: 30_999 })).toMatchObject({ solved: 1 });
  expect(advanceChallenge(words, input, { type: "submit", at: 31_000 })).toEqual({
    phase: "finished", solved: 0, timedOut: true, elapsedMs: 30_000,
  });
  expect(targetWord(start.words, words.length)).toBe(firstWord);
});

it("shuffles the challenge list with the seed for each start", () => {
  const first = advanceChallenge(words, { phase: "ready" }, { type: "start", at: 0, seed: 1 });
  if (first.phase !== "running") throw new Error("Expected a running challenge.");
  const finished = advanceChallenge(words, first, { type: "stop", at: 1 });
  const second = advanceChallenge(words, finished, { type: "start", at: 2, seed: 2 });

  expect(second.phase).toBe("running");
  if (second.phase !== "running") throw new Error("Expected a running challenge.");
  expect(new Set(first.words)).toEqual(new Set(words));
  expect(second.words).not.toEqual(first.words);
});

it("pauses once across settings and app inactivity, then resumes the same timer", () => {
  const start = advanceChallenge(words, { phase: "ready" }, { type: "start", at: 1_000, seed: 1 });
  if (start.phase !== "running") throw new Error("Expected a running challenge.");
  const settingsPaused = advanceChallenge(words, start, {
    type: "pause-reason", reason: "settings", paused: true, at: 5_000,
  });
  const duplicateSettingsPause = advanceChallenge(words, settingsPaused, {
    type: "pause-reason", reason: "settings", paused: true, at: 7_000,
  });
  const alsoInactive = advanceChallenge(words, duplicateSettingsPause, {
    type: "pause-reason", reason: "app-inactive", paused: true, at: 6_000,
  });
  const ignoredTick = advanceChallenge(words, alsoInactive, { type: "tick", at: 30_000 });
  const ignoredSubmit = advanceChallenge(words, ignoredTick, { type: "submit", at: 30_000 });
  expect(ignoredSubmit).toBe(ignoredTick);
  if (ignoredTick.phase !== "running") throw new Error("Expected a running challenge.");
  const finalizedInput = advanceChallenge(words, ignoredTick, { type: "input", input: "바", at: 30_000 });
  expect(finalizedInput).toMatchObject({ phase: "running", input: "바", now: ignoredTick.now });
  const windowReturned = advanceChallenge(words, finalizedInput, {
    type: "pause-reason", reason: "app-inactive", paused: false, at: 12_000,
  });
  if (windowReturned.phase !== "running") throw new Error("Expected a running challenge.");
  expect(windowReturned.pauseReasons).toEqual(["settings"]);
  expect(challengeElapsedMs(windowReturned, 14_000)).toBe(4_000);

  const resumed = advanceChallenge(words, windowReturned, {
    type: "pause-reason", reason: "settings", paused: false, at: 15_000,
  });
  if (resumed.phase !== "running") throw new Error("Expected a running challenge.");
  const stopped = advanceChallenge(words, resumed, { type: "stop", at: 18_000 });
  expect(stopped).toEqual({ phase: "finished", solved: 0, elapsedMs: 7_000, timedOut: false });
});

it("does not restart a timer past its deadline and tolerates a backwards timestamp", () => {
  const start = advanceChallenge(words, { phase: "ready" }, { type: "start", at: 1_000, seed: 1 });
  if (start.phase !== "running") throw new Error("Expected a running challenge.");
  const tick = advanceChallenge(words, start, { type: "tick", at: 11_000 });
  const backwardTick = advanceChallenge(words, tick, { type: "tick", at: 4_000 });
  if (backwardTick.phase !== "running") throw new Error("Expected a running challenge.");
  expect(challengeElapsedMs(backwardTick)).toBe(10_000);
  expect(advanceChallenge(words, backwardTick, {
    type: "pause-reason", reason: "settings", paused: true, at: 31_000,
  })).toEqual({ phase: "finished", solved: 0, elapsedMs: 30_000, timedOut: true });
});
