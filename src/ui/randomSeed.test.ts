import { afterEach, expect, it, vi } from "vitest";
import { createRunSeed } from "./randomSeed";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("uses Web Crypto for a run seed when it is available", () => {
  vi.stubGlobal("crypto", {
    getRandomValues: (values: Uint32Array) => {
      values[0] = 0x12345678;
      return values;
    },
  });

  expect(createRunSeed()).toBe(0x12345678);
});

it("uses changing clock values if Web Crypto is unavailable or returns zero", () => {
  vi.stubGlobal("crypto", {
    getRandomValues: () => { throw new Error("Web Crypto is unavailable."); },
  });
  vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  vi.spyOn(performance, "now").mockReturnValue(123.456);

  const first = createRunSeed();
  const second = createRunSeed();
  expect(first).not.toBe(0);
  expect(second).not.toBe(first);

  vi.stubGlobal("crypto", {
    getRandomValues: (values: Uint32Array) => {
      values[0] = 0;
      return values;
    },
  });
  expect(createRunSeed()).not.toBe(0);
});
