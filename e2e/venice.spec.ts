import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { veniceStorageKey } from "../src/storage/veniceStorage";
import { stubCompletionTone } from "./helpers/audio";
import { seedPreferences } from "./helpers/preferences";

async function openVenice(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  await page.getByRole("button", { name: "베네치아", exact: true }).click();
  await expect(page.getByRole("heading", { name: "베네치아" }).first()).toBeVisible();
}

test("Venice starts from a keyboard-selected level, scores words, and saves a local Top 10 result", async ({ page }) => {
  await page.clock.install();
  await openVenice(page);
  const startButton = page.getByRole("button", { name: "게임 시작" });
  await expect(startButton).toBeFocused();

  const screenshot = page.waitForEvent("download");
  await page.getByRole("button", { name: /화면 저장/ }).click();
  expect((await screenshot).suggestedFilename()).toMatch(/^tagak-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/);
  await startButton.focus();

  const level = page.locator("#venice-level");
  await page.keyboard.press("ArrowUp");
  await expect(level).toHaveValue("2");
  await page.keyboard.press("ArrowDown");
  await expect(level).toHaveValue("1");
  await page.keyboard.press("Enter");

  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  await expect(input).toBeFocused();
  await page.clock.runFor(3_500);
  const fallingWords = page.locator(".venice-falling-word");
  await expect(fallingWords.first()).toBeVisible();
  await expect(page.locator(".venice-collision-line")).toBeVisible();
  await expect(page.locator(".venice-collision-line")).toContainText("충돌선");
  expect(await fallingWords.first().evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("nowrap");
  const word = (await fallingWords.first().textContent())?.trim();
  expect(word).toBeTruthy();

  await input.fill(word!);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  const score = page.locator(".venice-hud dd").nth(2);
  await expect(score).not.toHaveText("0");

  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await expect(input).toBeVisible();
  await expect(page.getByRole("button", { name: "낱말 확정" })).toBeVisible();
  await expect(page.getByRole("button", { name: "게임 마치기" })).toBeVisible();

  await page.getByRole("button", { name: "게임 마치기" }).click();
  await expect(page.getByRole("heading", { name: "베네치아 결과" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "로컬 Top 10 하이스코어" })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return [stored?.recentRuns?.length ?? 0, stored?.topScores?.length ?? 0];
  }, veniceStorageKey)).toEqual([1, 1]);
  await expect(page.locator(".venice-scores-table tr[aria-current='true']")).toHaveCount(1);

  await page.getByRole("button", { name: "다른 레벨 선택" }).click();
  await level.selectOption("14");
  await page.getByRole("button", { name: "게임 시작" }).click();
  await expect(page.locator(".venice-hud dd").nth(1)).toHaveText("1000");
  await page.clock.runFor(600);
  const highLevelWord = page.locator(".venice-falling-word").first();
  await expect(highLevelWord).toBeVisible();
  expect(await highLevelWord.evaluate((element) => getComputedStyle(element).whiteSpace)).toBe("nowrap");
  await page.getByRole("button", { name: "게임 마치기" }).click();
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return stored?.recentRuns?.length ?? 0;
  }, veniceStorageKey)).toBe(1);
});

test("Venice separates IME composition from submission and pauses for settings", async ({ page }) => {
  await page.clock.install();
  await openVenice(page);
  await page.getByRole("button", { name: "게임 시작" }).click();
  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  await page.clock.runFor(3_500);
  const word = (await page.locator(".venice-falling-word").first().textContent())?.trim();
  expect(word).toBeTruthy();

  await input.evaluate((element, value) => {
    const field = element as HTMLInputElement;
    field.focus();
    field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field.value = value;
    field.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: value,
      inputType: "insertCompositionText",
      isComposing: true,
    }));
    field.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      key: "Enter",
      code: "Enter",
      keyCode: 229,
      isComposing: true,
    }));
    field.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: value }));
    field.dispatchEvent(new KeyboardEvent("keyup", {
      bubbles: true,
      key: "Enter",
      code: "Enter",
    }));
  }, word!);
  await expect(input).toHaveValue(word!);
  await expect(page.locator(".venice-hud dd").nth(2)).toHaveText("0");
  const blockedEdits = await input.evaluate((element) => {
    const paste = new ClipboardEvent("paste", { bubbles: true, cancelable: true });
    const drop = new DragEvent("drop", { bubbles: true, cancelable: true });
    const pastePrevented = !element.dispatchEvent(paste);
    const dropPrevented = !element.dispatchEvent(drop);
    return [pastePrevented, dropPrevented];
  });
  expect(blockedEdits).toEqual([true, true]);
  await input.press("Enter");
  await expect(page.locator(".venice-hud dd").nth(2)).not.toHaveText("0");

  await page.clock.runFor(2_700);
  const visibleWord = page.locator(".venice-falling-word").first();
  const topBeforeSettings = Number((await visibleWord.getAttribute("style"))?.match(/top: ([\d.]+)%/)?.[1] ?? 0);
  await page.getByRole("button", { name: "환경설정" }).click();
  await expect(page.getByRole("heading", { name: "환경설정" })).toBeVisible();
  const topWhileSettings = Number((await visibleWord.getAttribute("style"))?.match(/top: ([\d.]+)%/)?.[1] ?? 0);
  await page.clock.runFor(5_000);
  await page.getByRole("button", { name: "← 뒤로" }).click();
  await expect(input).toBeFocused();
  const topAfterSettings = Number((await visibleWord.getAttribute("style"))?.match(/top: ([\d.]+)%/)?.[1] ?? 0);
  expect(Math.abs(topWhileSettings - topBeforeSettings)).toBeLessThan(1);
  expect(Math.abs(topAfterSettings - topWhileSettings)).toBeLessThan(1);

  const topBeforeTabHide = Number((await visibleWord.getAttribute("style"))?.match(/top: ([\d.]+)%/)?.[1] ?? 0);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".venice-pause-overlay")).toBeVisible();
  await page.clock.runFor(5_000);
  const topDuringTabHide = Number((await visibleWord.getAttribute("style"))?.match(/top: ([\d.]+)%/)?.[1] ?? 0);
  expect(Math.abs(topDuringTabHide - topBeforeTabHide)).toBeLessThan(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(input).toBeFocused();
});

test("Venice clears an unmatched submission and keeps the mismatch notice", async ({ page }) => {
  await page.clock.install();
  await openVenice(page);
  await page.getByRole("button", { name: "게임 시작" }).click();
  await page.clock.runFor(3_500);

  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  const word = (await page.locator(".venice-falling-word").first().textContent())?.trim();
  expect(word).toBeTruthy();
  await input.fill("화면에 없는 입력");
  await input.press("Enter");

  await expect(input).toHaveValue("");
  await expect(page.getByRole("status")).toContainText("보이는 낱말과 일치하는 입력이 없습니다");
  await expect(page.locator(".venice-falling-word")).toContainText(word!);
  await input.fill(word!);
  await input.press("Enter");
  await expect(page.locator(".venice-hud dd").nth(2)).not.toHaveText("0");
});

test("Venice plays typing, hit, and finish feedback when sound is enabled", async ({ page }) => {
  await page.clock.install();
  const toneStarts = await stubCompletionTone(page);
  await seedPreferences(page, {
    interfaceLanguage: "ko",
    practiceLanguage: "ko",
    completionSound: true,
    typingSpeedUnits: { ko: "cpm", en: "wpm" },
  });
  await openVenice(page);
  await page.getByRole("button", { name: "게임 시작" }).click();
  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  await page.clock.runFor(3_500);
  const word = (await page.locator(".venice-falling-word").first().textContent())?.trim();
  expect(word).toBeTruthy();

  await input.fill(word!);
  await expect.poll(toneStarts).toBe(1);
  await input.press("Enter");
  await expect.poll(toneStarts).toBe(2);
  await page.getByRole("button", { name: "게임 마치기" }).click();
  await expect.poll(toneStarts).toBe(3);
});

test("Venice stays silent when the existing sound preference is disabled", async ({ page }) => {
  await page.clock.install();
  const toneStarts = await stubCompletionTone(page);
  await seedPreferences(page, {
    interfaceLanguage: "ko",
    practiceLanguage: "ko",
    completionSound: false,
    typingSpeedUnits: { ko: "cpm", en: "wpm" },
  });
  await openVenice(page);
  await page.getByRole("button", { name: "게임 시작" }).click();
  await page.clock.runFor(3_500);
  const mutedInput = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  const mutedWord = (await page.locator(".venice-falling-word").first().textContent())?.trim();
  expect(mutedWord).toBeTruthy();
  await mutedInput.fill(mutedWord!);
  await mutedInput.press("Enter");
  await page.getByRole("button", { name: "게임 마치기" }).click();
  expect(await toneStarts()).toBe(0);
});

test("Venice keeps the result visible and preserves damaged storage after a save failure", async ({ page }) => {
  await page.clock.install();
  await openVenice(page);
  await page.evaluate((key) => localStorage.setItem(key, "{broken"), veniceStorageKey);
  await page.getByRole("button", { name: "게임 시작" }).click();
  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  await page.clock.runFor(3_500);
  const word = (await page.locator(".venice-falling-word").first().textContent())?.trim();
  expect(word).toBeTruthy();
  await input.fill(word!);
  await input.press("Enter");
  await page.getByRole("button", { name: "게임 마치기" }).click();

  await expect(page.getByText("결과를 저장하지 못했습니다. 이번 결과는 화면에서 확인할 수 있습니다.")).toBeVisible();
  await expect(page.locator(".venice-scores-table tr[aria-current='true']")).toHaveCount(1);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), veniceStorageKey)).toBe("{broken");
});

test("Escape finishes from the app header but an IME composition Escape does not", async ({ page }) => {
  await page.clock.install();
  await openVenice(page);
  await page.getByRole("button", { name: "게임 시작" }).click();
  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  await input.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      key: "Escape",
      code: "Escape",
      keyCode: 229,
      isComposing: true,
    }));
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Escape", code: "Escape" }));
  });
  await expect(page.getByRole("heading", { name: "베네치아 결과" })).toHaveCount(0);

  await page.getByRole("button", { name: "환경설정" }).focus();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "베네치아 결과" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).toBeFocused();
});

test("Venice recommends the previous stable level and keeps the keyboard choice editable", async ({ page }) => {
  const recentRun = {
    id: "stable-level-three",
    rulesVersion: 1,
    startedAt: 1_000,
    completedAt: 6_000,
    startLevel: 3,
    highestLevel: 3,
    score: 100,
    typedWords: 8,
    missedWords: 2,
    durationMs: 5_000,
    levelStats: [{ level: 3, spawned: 10, typedCorrectly: 8, missed: 2, durationMs: 5_000 }],
  };
  await page.addInitScript(({ key, run }) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      rulesVersion: 1,
      recentRuns: [run],
      topScores: [run],
    }));
  }, { key: veniceStorageKey, run: recentRun });
  await openVenice(page);

  const level = page.locator("#venice-level");
  await expect(level).toHaveValue("4");
  await page.keyboard.press("ArrowUp");
  await expect(level).toHaveValue("5");
  await page.keyboard.press("ArrowDown");
  await expect(level).toHaveValue("4");
});
