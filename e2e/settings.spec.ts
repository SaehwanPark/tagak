import { expect, test } from "@playwright/test";
import { appPreferencesKey } from "../src/storage/appPreferences";
import { seedPreferences } from "./helpers/preferences";
import { stubCompletionTone } from "./helpers/audio";
import { historyKey } from "../src/storage/historyStorage";

test("settings are reachable by keyboard and return focus to the home entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "[연습] 두벌식 자리 연습" })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  const settingsEntry = page.getByRole("button", { name: "[기타] 환경설정" });
  await expect(settingsEntry).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /인터페이스 언어/ })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(settingsEntry).toBeFocused();
});

test("completion sound is off by default", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 환경설정" }).click();
  await expect(page.getByRole("button", { name: /효과음/ })).toContainText("끔");
});

test("interface and practice languages are independent and filter home content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 환경설정" }).click();
  await page.getByRole("button", { name: /인터페이스 언어/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: /Practice language/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await page.getByRole("button", { name: "← Menu" }).click();

  await expect(page.getByRole("heading", { name: "Typing practice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Practice] One-line drills" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Practice] Words" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Practice] Two-set keyboard positions" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "[Practice] Short passages" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Practice] Long passages" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Game] 30-second word challenge" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "[Game] Venice" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "[Other] Free typing" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Other] Recent practice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "[Other] Settings" })).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await expect(page.getByRole("button", { name: "[Practice] Words" })).toBeVisible();
});

test("speed units have language-specific defaults and save independently", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 환경설정" }).click();
  const koreanUnit = page.getByRole("button", { name: /한국어 속도 단위/ });
  const englishUnit = page.getByRole("button", { name: /영어 속도 단위/ });
  await expect(koreanUnit).toContainText("분당 타수 (CPM)");
  await expect(englishUnit).toContainText("분당 단어 수 (WPM)");

  await koreanUnit.click();
  await englishUnit.click();
  await expect.poll(() => page.evaluate((key) => {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null");
    return [saved?.version, saved?.preferences?.typingSpeedUnits?.ko, saved?.preferences?.typingSpeedUnits?.en];
  }, appPreferencesKey)).toEqual([2, "wpm", "cpm"]);

  await page.getByRole("button", { name: "환경설정을 기본값으로 되돌리기" }).click();
  await expect(koreanUnit).toContainText("분당 타수 (CPM)");
  await expect(englishUnit).toContainText("분당 단어 수 (WPM)");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), appPreferencesKey)).toBeNull();
});

test("A12 preferences migrate and English WPM stays consistent in results and history", async ({ page }) => {
  await seedPreferences(page, {
    interfaceLanguage: "en", practiceLanguage: "en", completionSound: false,
  }, 1);
  // Virtual time keeps the speed comparison deterministic instead of waiting 1.1 real seconds per word.
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "[Other] Settings" }).click();
  const koreanUnit = page.getByRole("button", { name: /Korean speed unit/ });
  await expect(koreanUnit).toContainText("Keystrokes/minute (CPM)");
  await koreanUnit.click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), appPreferencesKey))
    .toMatchObject({ version: 2, preferences: { interfaceLanguage: "en", practiceLanguage: "en", completionSound: false, typingSpeedUnits: { ko: "wpm", en: "wpm" } } });
  await page.getByRole("button", { name: "← Menu" }).click();

  async function completeEnglishWord() {
    await page.getByRole("button", { name: "[Practice] Words" }).click();
    const input = page.getByRole("textbox", { name: "Type the prompt" });
    const prompt = await page.locator("#typing-target").getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await page.clock.fastForward(1_200);
    await input.press("Enter");
    await expect(page.getByRole("heading", { name: "Practice complete" })).toBeVisible();
    const result = page.locator('dl[aria-label="This result"]');
    await expect(result.locator("dt").nth(1)).toHaveText("Words/min");
    return result.locator("dd").nth(1).textContent();
  }

  const firstDisplayedSpeed = await completeEnglishWord();
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return stored?.records?.length ?? 0;
  }, historyKey)).toBe(1);
  const firstRawSpeed = await page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return stored.records[0].score.charactersPerMinute;
  }, historyKey);
  expect(firstDisplayedSpeed).toBe(String(Math.round(firstRawSpeed / 5)));

  await page.getByRole("button", { name: "Return to Menu" }).click();
  const secondDisplayedSpeed = await completeEnglishWord();
  await expect(page.locator('dl[aria-label="Previous result"] dt').nth(1)).toHaveText("Words/min");
  await expect(secondDisplayedSpeed).not.toBeNull();
  await page.getByRole("button", { name: "Return to Menu" }).click();
  await page.getByRole("button", { name: "[Other] Recent practice" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(page.getByRole("listitem").first()).toContainText("words/min");
});

test("completion sound plays only after submitting a practice item", async ({ page }) => {
  // v1 is still readable; the sound flag survives that migration.
  await seedPreferences(page, {
    interfaceLanguage: "ko", practiceLanguage: "ko", completionSound: true,
  }, 1);
  const tones = await stubCompletionTone(page);
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();

  await input.fill(prompt!.slice(0, 1));
  await expect.poll(tones).toBe(0);
  await input.fill(prompt!);
  await expect.poll(tones).toBe(0);
  await input.press("Enter");
  await expect.poll(tones).toBe(1);
});
