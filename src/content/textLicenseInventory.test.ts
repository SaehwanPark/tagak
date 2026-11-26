import { expect, it } from "vitest";
import documented from "../../TEXT-LICENSES.md?raw";
import rawKoreanLines from "./assets/one-line.ko.json";
import rawEnglishLines from "./assets/one-line.en.json";
import rawKoreanPassages from "./assets/passages.ko.json";
import rawEnglishPassages from "./assets/passages.en.json";
import { activities } from "./library";
import { passageActivities } from "./passages";
import { textLicenseMarkdown } from "./textLicenseInventory";

it("keeps TEXT-LICENSES.md aligned with the practice-text assets", () => {
  // Regenerate with `npm run text-licenses:update` when this fails.
  expect(documented).toBe(textLicenseMarkdown());
  expect(documented).toContain("발췌; 연습용 문단·화면 줄바꿈");
  expect(documented).toContain("발췌; 화면 줄바꿈");
});

it("does not silently drop a passage asset from the license inventory", () => {
  // Invalid passages are filtered out at the content boundary. Comparing raw
  // and loaded counts keeps a missing credit from disappearing from the doc.
  expect(passageActivities).toHaveLength(rawKoreanPassages.length + rawEnglishPassages.length);
});

it("loads the curated one-line prompts after content-boundary filtering", () => {
  const koreanLines = activities.find((activity) => activity.id === "ko-line");
  const englishLines = activities.find((activity) => activity.id === "en-line");
  const loadedCount = (activity: typeof koreanLines) => activity?.kind === "line" ? activity.lessons.length : 0;

  expect(rawKoreanLines).toHaveLength(100);
  expect(rawEnglishLines).toHaveLength(100);
  expect(rawKoreanLines.some((lesson) => lesson.source === "quote")).toBe(false);
  expect(rawEnglishLines.some((lesson) => lesson.source === "quote")).toBe(false);
  expect(loadedCount(koreanLines)).toBe(100);
  expect(loadedCount(englishLines)).toBe(100);
});
