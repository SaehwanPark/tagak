import { expect, it } from "vitest";
import { normalizeSeed, nextRandom, shuffleWithSeed } from "./random";

it("normalizes invalid and zero seeds to a non-zero state", () => {
  expect(normalizeSeed(0)).toBe(0x9e3779b9);
  expect(normalizeSeed(Number.NaN)).toBe(0x9e3779b9);
  expect(normalizeSeed(0x1_0000_0001)).toBe(1);
  expect(nextRandom(0).randomState).not.toBe(0);
});

it("shuffles a non-empty sequence reproducibly without changing its source", () => {
  const values = ["a", "b", "c", "d", "e"] as const;
  const first = shuffleWithSeed(values, 0x12345678);

  expect(shuffleWithSeed(values, 0x12345678)).toEqual(first);
  expect(shuffleWithSeed(values, 0x87654321)).not.toEqual(first);
  expect([...first].sort()).toEqual([...values].sort());
  expect(values).toEqual(["a", "b", "c", "d", "e"]);
});
