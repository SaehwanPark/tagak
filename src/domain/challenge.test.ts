import { expect, it } from "vitest";
import { advanceChallenge, targetWord } from "./challenge";

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
