import { expect, test } from "@playwright/test";
import { appPreferencesKey } from "../src/storage/appPreferences";
import { seedPreferences } from "./helpers/preferences";
import { stubCompletionTone } from "./helpers/audio";
import { historyKey } from "../src/storage/historyStorage";

test("settings are reachable by keyboard and return focus to the home entry", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  const settingsEntry = page.getByRole("button", { name: "환경설정" });
  await expect(settingsEntry).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /인터페이스 언어/ })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(settingsEntry).toBeFocused();
});

test("history and backup settings subviews are keyboard reachable in Korean and English", async ({ page }) => {
  await page.goto("/");
  const settingsEntry = page.getByRole("button", { name: "환경설정" });
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(settingsEntry).toBeFocused();
  await page.keyboard.press("Enter");
  const interfaceLanguage = page.getByRole("button", { name: /인터페이스 언어/ });
  await expect(interfaceLanguage).toBeFocused();

  async function checkSettingsSubviews(historyLabel: string, transferLabel: string, transferTitle: string) {
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    const historyEntry = page.getByRole("button", { name: historyLabel });
    await expect(historyEntry).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: historyLabel })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(historyEntry).toBeFocused();

    await page.keyboard.press("ArrowDown");
    const transferEntry = page.getByRole("button", { name: transferLabel });
    await expect(transferEntry).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: transferTitle })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(transferEntry).toBeFocused();
  }

  await checkSettingsSubviews("최근 연습 기록", "데이터 백업·가져오기", "데이터 백업·가져오기");
  await page.keyboard.press("Home");
  await expect(interfaceLanguage).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await checkSettingsSubviews("Recent practice", "Back up and restore data", "Back up and restore data");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Settings" })).toBeFocused();
});

test("completion sound is off by default", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await expect(page.getByRole("button", { name: /효과음/ })).toContainText("끔");
});

test("interface and practice languages are independent and the five home entries stay stable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: /인터페이스 언어/ }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: /Practice language/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await page.getByRole("button", { name: "← Menu" }).click();

  await expect(page.getByRole("heading", { name: "Typing practice" })).toBeVisible();
  const homeEntries = page.locator(".home-menu-screen .activity-menu button");
  await expect(homeEntries).toHaveText(["One-line drills↵", "Short passages↵", "Long passages↵", "Games↵", "Settings↵"]);
  await page.getByRole("button", { name: "Games", exact: true }).click();
  await expect(page.getByRole("button", { name: "30-second word challenge", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Venice", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Games", exact: true })).toBeFocused();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await expect(page.locator(".home-menu-screen .activity-menu button")).toHaveCount(5);
});

test("speed units have language-specific defaults and save independently", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
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
  await page.getByRole("button", { name: "Settings" }).click();
  const koreanUnit = page.getByRole("button", { name: /Korean speed unit/ });
  await expect(koreanUnit).toContainText("Keystrokes/minute (CPM)");
  await koreanUnit.click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), appPreferencesKey))
    .toMatchObject({ version: 2, preferences: { interfaceLanguage: "en", practiceLanguage: "en", completionSound: false, typingSpeedUnits: { ko: "wpm", en: "wpm" } } });
  await page.getByRole("button", { name: "← Menu" }).click();

  async function completeEnglishLine() {
    await page.getByRole("button", { name: "One-line drills" }).click();
    const input = page.getByRole("textbox", { name: "Type the prompt" });
    const prompt = await page.locator("#typing-target").getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await page.clock.fastForward(1_200);
    await input.press("Enter");
    await page.getByRole("button", { name: "Finish practice" }).click();
    await expect(page.getByRole("heading", { name: "Practice complete" })).toBeVisible();
    const result = page.locator('dl[aria-label="This result"]');
    await expect(result.locator("dt").nth(1)).toHaveText("Words/min");
    return result.locator("dd").nth(1).textContent();
  }

  const firstDisplayedSpeed = await completeEnglishLine();
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
  const secondDisplayedSpeed = await completeEnglishLine();
  await expect(page.locator('dl[aria-label="Previous result"] dt').nth(1)).toHaveText("Words/min");
  await expect(secondDisplayedSpeed).not.toBeNull();
  await page.getByRole("button", { name: "Return to Menu" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Recent practice" }).click();
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
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
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
