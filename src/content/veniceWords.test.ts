import { describe, expect, it } from "vitest";
import {
  availableVeniceWords,
  candidateVeniceWords,
  targetCpm,
  veniceLevelCount,
  veniceStageConfig,
} from "../domain/venice";
import { countKoreanKeystrokes } from "../domain/typing";
import { readVeniceWords, veniceWords } from "./veniceWords";

describe("Venice word content", () => {
  it("validates optional minimum-level metadata and keeps legacy string entries", () => {
    const words = readVeniceWords([
      { text: "우주선", minimumLevel: 13 },
      { text: "등굣길", minimumLevel: 7 },
      { text: "발전소", minimumLevel: 11 },
      { text: "나무", minimumLevel: 0 },
      { text: "강물" },
      "우주선",
    ]);

    expect(words.map(({ text, minimumLevel }) => [text, minimumLevel])).toEqual([
      ["우주선", 13],
      ["등굣길", 7],
      ["발전소", 11],
      ["강물", undefined],
    ]);
  });

  it("loads a substantial unique Korean word pool with matching keystroke counts", () => {
    expect(veniceWords.length).toBeGreaterThanOrEqual(100);
    expect(new Set(veniceWords.map((word) => word.text)).size).toBe(veniceWords.length);
    expect(veniceWords.every((word) => /^[가-힣]{2,8}$/u.test(word.text)
      && word.keystrokes === countKoreanKeystrokes(word.text))).toBe(true);
    expect(veniceWords.filter((word) => word.minimumLevel !== undefined)
      .every((word) => [7, 11, 13].includes(word.minimumLevel ?? 0))).toBe(true);
  });

  it("supplies 24 fresh words at every level of a normal level 1 to 14 run", () => {
    const usedWordTexts = new Set<string>();
    for (let level = 1; level <= veniceLevelCount; level += 1) {
      for (let draw = 0; draw < 24; draw += 1) {
        const available = availableVeniceWords(veniceWords, level, [...usedWordTexts]);
        const word = available[0];
        expect(word).toBeDefined();
        expect(usedWordTexts.has(word!.text)).toBe(false);
        usedWordTexts.add(word!.text);
      }
    }
    expect(usedWordTexts.size).toBe(336);
  });

  it("keeps each level's filtered pool and keystroke distribution within its design", () => {
    const summaries = Array.from({ length: veniceLevelCount }, (_, index) => {
      const level = index + 1;
      const stage = veniceStageConfig(level);
      const candidates = candidateVeniceWords(veniceWords, level);
      const lengths = candidates.map((word) => Array.from(word.text).length);
      const keystrokes = candidates.map((word) => word.keystrokes);
      const averageKeystrokes = keystrokes.reduce((total, value) => total + value, 0) / keystrokes.length;

      expect(candidates.length).toBeGreaterThanOrEqual(30);
      expect(candidates.every((word) => (word.minimumLevel ?? 1) <= level)).toBe(true);
      expect(lengths.every((length) => length >= stage.minSyllables && length <= stage.maxSyllables)).toBe(true);
      expect(new Set(lengths).size).toBeGreaterThan(1);
      expect(new Set(keystrokes).size).toBeGreaterThan(2);
      return { count: candidates.length, averageKeystrokes };
    });

    expect(summaries.slice(0, 12).map(({ count }) => count)).toEqual([
      148, 148, 148, 149, 149, 149, 167, 167, 167, 167, 237, 237,
    ]);
    expect(summaries[12]?.count).toBe(209);
    expect(summaries[13]?.count).toBe(209);

    const originalPool = veniceWords.filter((word) => word.minimumLevel === undefined);
    const originalSpawnIntervals = [1_212, 1_037, 891, 763, 653, 559];
    for (let level = 7; level <= 12; level += 1) {
      const currentAverage = summaries[level - 1]!.averageKeystrokes;
      const originalCandidates = candidateVeniceWords(originalPool, level);
      const originalAverage = originalCandidates.reduce((total, word) => total + word.keystrokes, 0)
        / originalCandidates.length;
      const previousInterval = originalSpawnIntervals[level - 7]!;
      expect(veniceStageConfig(level).spawnIntervalMs)
        .toBe(Math.round(previousInterval * currentAverage / originalAverage));
      expect(currentAverage * 60_000 / veniceStageConfig(level).spawnIntervalMs)
        .toBeLessThanOrEqual(targetCpm(level) * 1.4);
    }

    for (const level of [13, 14]) {
      const stage = veniceStageConfig(level);
      const candidates = candidateVeniceWords(veniceWords, level);
      const lengths = new Set(candidates.map((word) => Array.from(word.text).length));
      const priorVocabulary = ["수수께끼", "스케치북", "해바라기", "아이스크림"];
      const priorAverageKeystrokes = priorVocabulary.reduce(
        (total, word) => total + countKoreanKeystrokes(word),
        0,
      ) / priorVocabulary.length;
      const averageKeystrokes = summaries[level - 1]!.averageKeystrokes;
      const impliedCpm = averageKeystrokes * 60_000 / stage.spawnIntervalMs;

      expect([...lengths].sort()).toEqual([4, 5, 6, 7]);
      expect(averageKeystrokes).toBeLessThanOrEqual(priorAverageKeystrokes * 1.3);
      expect(impliedCpm).toBeLessThanOrEqual(targetCpm(level) * 1.4);
    }
  });
});
