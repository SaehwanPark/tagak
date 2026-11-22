import { describe, expect, it } from "vitest";
import { countKoreanKeystrokes } from "../domain/typing";
import { veniceWords } from "./veniceWords";

describe("Venice word content", () => {
  it("loads a substantial unique Korean word pool with matching keystroke counts", () => {
    expect(veniceWords.length).toBeGreaterThanOrEqual(100);
    expect(new Set(veniceWords.map((word) => word.text)).size).toBe(veniceWords.length);
    expect(veniceWords.every((word) => /^[가-힣]{2,8}$/u.test(word.text)
      && word.keystrokes === countKoreanKeystrokes(word.text))).toBe(true);
  });
});
