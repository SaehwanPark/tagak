import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { colorThemeKey, practiceFontKey, settingsKey } from "../src/storage/settingsStorage";
import { appPreferencesKey } from "../src/storage/appPreferences";

async function openSettings(page: Page) {
  await page.getByRole("button", { name: /환경설정$/ }).click();
}

async function closeSettings(page: Page) {
  await page.getByRole("button", { name: "← 메뉴" }).click();
}

test("text size changes from settings, survives reload, and can be reset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.fill("한글");
  await openSettings(page);
  await expect(page.getByRole("button", { name: /연습 언어/ })).toBeDisabled();
  await page.getByRole("button", { name: /연습 글자 크기/ }).click();
  await page.getByRole("button", { name: /연습 글자 크기/ }).click();
  await page.getByRole("button", { name: "← 뒤로" }).click();
  await expect(input).toHaveValue("한글");
  await expect(input).toHaveCSS("font-size", "32px");
  await expect(page.locator("#typing-target")).toHaveCSS("font-size", "32px");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toContain("largest");

  await page.reload();
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  await expect(input).toHaveCSS("font-size", "32px");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await openSettings(page);
  await page.getByRole("button", { name: "기본 크기로 되돌리기" }).click();
  await closeSettings(page);
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "따라 입력하기" })).toHaveCSS("font-size", "21.6px");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toBeNull();
});

test("color theme persists and resets independently from text size", async ({ page }) => {
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: /연습 글자 크기/ }).click();
  await page.getByRole("button", { name: /연습 글자 크기/ }).click();
  await page.getByRole("button", { name: /색상 테마/ }).click();
  await page.getByText("테마 바로 선택").click();
  await page.getByRole("radio", { name: /종이 밝음/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect(page.locator(".shell")).toHaveCSS("background-color", "rgb(255, 253, 248)");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toContain("paper");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await openSettings(page);
  await page.getByRole("button", { name: "기본 색상으로 되돌리기" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "terminal");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await expect(page.getByRole("button", { name: /연습 글자 크기/ })).toContainText("아주 크게");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toBeNull();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toContain("largest");
});

test("theme list supports direct keyboard choice in English and a small viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 520 });
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: /인터페이스 언어/ }).click();
  await page.getByText("Choose a theme directly").click();
  await expect(page.getByRole("radio")).toHaveCount(14);

  await page.keyboard.press("Tab");
  await page.keyboard.press("End");
  const nordLight = page.getByRole("radio", { name: /Nord Light/ });
  await expect(nordLight).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "nord-light");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toContain("nord-light");

  const menuBox = await page.locator(".settings-menu").boundingBox();
  const optionBox = await nordLight.boundingBox();
  expect(menuBox).not.toBeNull();
  expect(optionBox).not.toBeNull();
  expect(optionBox!.y).toBeGreaterThanOrEqual(menuBox!.y);
  expect(optionBox!.y + optionBox!.height).toBeLessThanOrEqual(menuBox!.y + menuBox!.height);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /Color theme/ })).toBeFocused();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "nord-light");
  await page.getByRole("button", { name: "Settings" }).click();
  const pickerSummary = page.getByText("Choose a theme directly");
  await pickerSummary.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await pickerSummary.click();
  await expect(page.getByRole("radio", { name: /Nord Light/ })).toHaveAttribute("aria-checked", "true");
});

test("practice fonts are kept separately for Korean and English", async ({ page }) => {
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: /연습 글꼴 · 한국어/ }).click();
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "gothic");
  await page.getByRole("button", { name: /연습 글꼴 · 영어/ }).click();
  await closeSettings(page);
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  await expect(page.locator("#typing-target")).toHaveCSS("font-family", 'Georgia, "Times New Roman", serif');
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await openSettings(page);
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await page.getByRole("button", { name: "환경설정을 기본값으로 되돌리기" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "gothic");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), practiceFontKey)).toBeNull();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), appPreferencesKey)).toBeNull();
});

test("a saved font from the earlier shared setting is retained for both languages", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, font: "serif" }));
  }, practiceFontKey);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await openSettings(page);
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
});

test("invalid theme data falls back without overwriting it", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{invalid"), colorThemeKey);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "terminal");
  await openSettings(page);
  await expect(page.getByRole("status")).toHaveText("저장된 환경설정을 읽지 못했습니다. 기본값을 사용하며 기존 값은 보존했습니다.");
  await page.getByRole("button", { name: /색상 테마/ }).click();

  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "amber-terminal");
  await expect(page.getByRole("status")).toHaveText("설정을 저장하지 못했습니다. 현재 탭에서만 적용됩니다.");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), colorThemeKey)).toBe("{invalid");
});

test("a denied practice font write applies in this tab and reports the failure", async ({ page }) => {
  await page.addInitScript((key) => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === key) throw new DOMException("Storage is unavailable", "QuotaExceededError");
      originalSetItem.call(this, storageKey, value);
    };
  }, practiceFontKey);
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: /연습 글꼴 · 한국어/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  await expect(page.getByRole("status")).toHaveText("설정을 저장하지 못했습니다. 현재 탭에서만 적용됩니다.");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), practiceFontKey)).toBeNull();
});

test("practice font applies to practice text while menus keep their font", async ({ page }) => {
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: /연습 글꼴 · 한국어/ }).click();
  await closeSettings(page);
  const menuFont = await page.locator(".lesson-button").first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(menuFont).not.toContain("Batang");

  await page.getByRole("button", { name: "짧은 글" }).click();
  await page.getByRole("button", { name: /새벽 강변/ }).click();
  await expect(page.locator(".passage-page li").first()).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(page.locator("#typing-target")).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');

  await page.goto("/");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  await page.getByRole("button", { name: "30초 낱말 도전", exact: true }).click();
  await page.getByRole("button", { name: "도전 시작" }).click();
  await expect(page.locator("#typing-target")).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
  await expect(page.getByRole("textbox", { name: "따라 입력하기" })).toHaveCSS("font-family", 'Batang, "Times New Roman", serif');
});
