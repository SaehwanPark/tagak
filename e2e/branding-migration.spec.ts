import { expect, test } from "@playwright/test";
import { appPreferencesKey } from "../src/storage/appPreferences";
import { historyKey } from "../src/storage/historyStorage";
import { legacyStorageKey } from "../src/storage/legacyStorage";
import type { StorageEntry } from "../src/storage/legacyStorage";
import { colorThemeKey, practiceFontKey, settingsKey } from "../src/storage/settingsStorage";

const legacyKeys: Record<StorageEntry, string> = {
  preferences: legacyStorageKey("preferences"),
  display: legacyStorageKey("display"),
  colorTheme: legacyStorageKey("colorTheme"),
  practiceFont: legacyStorageKey("practiceFont"),
  history: legacyStorageKey("history"),
};

test("uses the Tagak title and language-specific brand", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("타각 — Tagak");
  await expect(page.locator(".brand")).toContainText("타각");

  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 2,
      preferences: {
        interfaceLanguage: "en",
        practiceLanguage: "ko",
        completionSound: false,
        typingSpeedUnits: { ko: "cpm", en: "wpm" },
      },
    }));
  }, appPreferencesKey);
  await page.reload();
  await expect(page.locator(".brand")).toContainText("Tagak");
  await expect(page).toHaveTitle("타각 — Tagak");
});

test("migrates all five legacy values and preserves history order and IDs", async ({ page }) => {
  const history = {
    version: 3,
    records: [
      { id: "older", materialId: "word-1", completedAt: 10, mode: "word", language: "en", score: {
        accuracy: 100, correctCount: 2, typedCount: 2, elapsedMs: 1_000,
        charactersPerMinute: 120, keystrokeCount: null, keystrokesPerMinute: null,
      } },
      { id: "newer", materialId: "word-2", completedAt: 20, mode: "word", language: "en", score: {
        accuracy: 90, correctCount: 9, typedCount: 10, elapsedMs: 2_000,
        charactersPerMinute: 300, keystrokeCount: null, keystrokesPerMinute: null,
      } },
    ],
  };
  await page.addInitScript(({ keys, historyValue }) => {
    localStorage.setItem(keys.preferences, JSON.stringify({ version: 1, preferences: {
      interfaceLanguage: "en", practiceLanguage: "en", completionSound: false,
    } }));
    localStorage.setItem(keys.display, JSON.stringify({ version: 1, size: "largest" }));
    localStorage.setItem(keys.colorTheme, JSON.stringify({ version: 1, theme: "paper" }));
    localStorage.setItem(keys.practiceFont, JSON.stringify({ version: 1, font: "serif" }));
    localStorage.setItem(keys.history, JSON.stringify(historyValue));
  }, { keys: legacyKeys, historyValue: history });

  await page.goto("/");
  await expect(page).toHaveTitle("타각 — Tagak");
  await expect(page.locator(".brand")).toContainText("Tagak");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.locator("html")).toHaveAttribute("data-practice-font", "serif");
  const currentKeys = [appPreferencesKey, settingsKey, colorThemeKey, practiceFontKey, historyKey];
  await expect.poll(() => page.evaluate(({ current, legacy }) => {
    return current.every((key) => localStorage.getItem(key) !== null) &&
      Object.values(legacy).every((key) => localStorage.getItem(key) === null);
  }, { current: currentKeys, legacy: legacyKeys })).toBe(true);
  const migratedIds = await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return value.records.map((record: { id: string }) => record.id);
  }, historyKey);
  expect(migratedIds).toEqual(["older", "newer"]);
  const migratedPreferences = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), appPreferencesKey);
  expect(migratedPreferences).toMatchObject({ version: 1, preferences: { interfaceLanguage: "en", practiceLanguage: "en" } });
});

test("current values win conflicts and corrupt current data never falls back", async ({ page }) => {
  await page.addInitScript(({ currentKey, legacyKey }) => {
    localStorage.setItem(currentKey, "{corrupt-current");
    localStorage.setItem(legacyKey, JSON.stringify({ version: 1, theme: "paper" }));
  }, { currentKey: colorThemeKey, legacyKey: legacyKeys.colorTheme });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "terminal");
  await page.getByRole("button", { name: "환경설정" }).click();
  await expect(page.getByRole("status")).toHaveText("저장된 환경설정을 읽지 못했습니다. 기본값을 사용하며 기존 값은 보존했습니다.");
  await expect.poll(() => page.evaluate(({ currentKey, legacyKey }) => [
    localStorage.getItem(currentKey), localStorage.getItem(legacyKey),
  ], { currentKey: colorThemeKey, legacyKey: legacyKeys.colorTheme })).toEqual([
    "{corrupt-current", JSON.stringify({ version: 1, theme: "paper" }),
  ]);
});

test("a valid current value wins without merging the legacy value", async ({ page }) => {
  await page.addInitScript(({ currentKey, legacyKey }) => {
    localStorage.setItem(currentKey, JSON.stringify({ version: 1, size: "standard" }));
    localStorage.setItem(legacyKey, JSON.stringify({ version: 1, size: "largest" }));
  }, { currentKey: settingsKey, legacyKey: legacyKeys.display });

  await page.goto("/");
  await expect(page.locator(".shell")).toHaveAttribute("data-text-size", "standard");
  await expect.poll(() => page.evaluate(({ currentKey, legacyKey }) => [
    localStorage.getItem(currentKey), localStorage.getItem(legacyKey),
  ], { currentKey: settingsKey, legacyKey: legacyKeys.display })).toEqual([
    JSON.stringify({ version: 1, size: "standard" }), JSON.stringify({ version: 1, size: "largest" }),
  ]);
});

test("invalid legacy data remains intact and is reported", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{invalid"), legacyKeys.colorTheme);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "terminal");
  await page.getByRole("button", { name: "환경설정" }).click();
  await expect(page.getByRole("status")).toHaveText("저장된 환경설정을 읽지 못했습니다. 기본값을 사용하며 기존 값은 보존했습니다.");
  await expect.poll(() => page.evaluate(({ currentKey, legacyKey }) => [
    localStorage.getItem(currentKey), localStorage.getItem(legacyKey),
  ], { currentKey: colorThemeKey, legacyKey: legacyKeys.colorTheme })).toEqual([null, "{invalid"]);
});

test("preserves a legacy value when writing the new key is denied", async ({ page }) => {
  await page.addInitScript(({ currentKey, legacyKey }) => {
    localStorage.setItem(legacyKey, JSON.stringify({ version: 1, theme: "paper" }));
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === currentKey) throw new DOMException("Storage is unavailable", "QuotaExceededError");
      originalSetItem.call(this, key, value);
    };
  }, { currentKey: colorThemeKey, legacyKey: legacyKeys.colorTheme });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect.poll(() => page.evaluate(({ currentKey, legacyKey }) => [
    localStorage.getItem(currentKey), localStorage.getItem(legacyKey),
  ], { currentKey: colorThemeKey, legacyKey: legacyKeys.colorTheme })).toEqual([
    null, JSON.stringify({ version: 1, theme: "paper" }),
  ]);
});

test("reset prevents a value written later by an older tab from returning", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, size: "largest" }));
  }, legacyKeys.display);
  await page.goto("/");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).not.toBeNull();
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: "기본 크기로 되돌리기" }).click();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), settingsKey)).toBeNull();

  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, size: "largest" }));
  }, legacyKeys.display);
  await page.reload();
  await expect(page.locator(".shell")).toHaveAttribute("data-text-size", "standard");
  expect(await page.evaluate((key) => localStorage.getItem(key), settingsKey)).toBeNull();
});
