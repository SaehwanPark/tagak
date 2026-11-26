import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { passagesFor } from "../src/content/passages";
import { historyKey } from "../src/storage/historyStorage";
import { colorThemeKey } from "../src/storage/settingsStorage";
import { veniceStorageKey, veniceStorageVersion } from "../src/storage/veniceStorage";
import { veniceRulesVersion } from "../src/domain/venice";

async function expectNoOuterScroll(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const root = document.querySelector("#root");
    const shell = document.querySelector(".shell");
    return {
      document: document.documentElement.scrollHeight > window.innerHeight
        || document.documentElement.scrollWidth > window.innerWidth,
      body: document.body.scrollHeight > document.body.clientHeight
        || document.body.scrollWidth > document.body.clientWidth,
      root: root ? root.scrollHeight > root.clientHeight || root.scrollWidth > root.clientWidth : true,
      shell: shell ? shell.scrollHeight > shell.clientHeight || shell.scrollWidth > shell.clientWidth : true,
    };
  })).toEqual({ document: false, body: false, root: false, shell: false });
}

async function expectInsideRegion(target: Locator, region: Locator) {
  const bounds = await target.evaluate((element) => {
    const targetRect = element.getBoundingClientRect();
    const regionRect = element.closest("[data-scroll-region]")!.getBoundingClientRect();
    return {
      targetTop: targetRect.top,
      targetBottom: targetRect.bottom,
      regionTop: regionRect.top,
      regionBottom: regionRect.bottom,
    };
  });
  expect(bounds.targetTop).toBeGreaterThanOrEqual(bounds.regionTop - 1);
  expect(bounds.targetBottom).toBeLessThanOrEqual(bounds.regionBottom + 1);
  await expect(region).toBeVisible();
}

async function expectIntersectsRegion(target: Locator, region: Locator) {
  const bounds = await target.evaluate((element) => {
    const targetRect = element.getBoundingClientRect();
    const regionRect = element.closest("[data-scroll-region]")!.getBoundingClientRect();
    return {
      intersection: Math.min(targetRect.bottom, regionRect.bottom) - Math.max(targetRect.top, regionRect.top),
    };
  });
  expect(bounds.intersection).toBeGreaterThan(0);
  await expect(region).toBeVisible();
}

test("home menu stays inside the app at standard, minimum, and wide short viewports", async ({ page }) => {
  await page.goto("/");

  for (const viewport of [
    { width: 1120, height: 960 },
    { width: 900, height: 700 },
    { width: 760, height: 560 },
    { width: 1280, height: 560 },
  ]) {
    await page.setViewportSize(viewport);
    await expectNoOuterScroll(page);
    const menu = page.locator(".home-menu-screen .activity-menu");
    await expect(menu.locator("button")).toHaveCount(5);
    expect(await menu.evaluate((element) => element.scrollHeight)).toBeLessThanOrEqual(
      await menu.evaluate((element) => element.clientHeight),
    );
  }

  await page.setViewportSize({ width: 320, height: 420 });
  await expectNoOuterScroll(page);
  await page.keyboard.press("End");
  await expect(page.getByRole("button", { name: "환경설정" })).toBeFocused();
  await expect(page.getByRole("button", { name: "환경설정" })).toBeVisible();
});

test("English and paper theme preserve the minimum viewport layout with large text", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: /인터페이스 언어/ }).click();
  await page.getByRole("button", { name: /Practice language/ }).click();
  const size = page.getByRole("button", { name: /Practice text size/ });
  await size.click();
  await size.click();
  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.getByText("Choose a theme directly").click();
  await page.getByRole("radio", { name: /Paper light/ }).click();
  await page.getByRole("button", { name: "← Menu" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-practice-language", "en");
  await expect(page.locator("html")).toHaveAttribute("data-color-theme", "paper");
  await expect(page.locator(".shell")).toHaveAttribute("data-text-size", "largest");
  await expect(page.getByRole("heading", { name: "Typing practice" })).toBeVisible();
  await expect(page.locator(".home-menu-screen .activity-menu button")).toHaveCount(5);
  await expectNoOuterScroll(page);
});

test("settings read errors remain visible in the minimum viewport", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, "{invalid"), colorThemeKey);
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  const notice = page.getByRole("status");
  await expect(notice).toContainText("저장된 환경설정을 읽지 못했습니다");
  await expect(notice).toBeVisible();
  await expectNoOuterScroll(page);
});

test("backup controls and import errors remain visible in the minimum viewport", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: "데이터 백업·가져오기" }).click();
  const screen = page.locator("section.screen").filter({
    has: page.getByRole("heading", { name: "데이터 백업·가져오기" }),
  });
  const exportButton = page.getByRole("button", { name: "백업 내보내기" });
  const importButton = page.getByRole("button", { name: "백업 가져오기" });
  await expect(exportButton).toBeVisible();
  await expect(importButton).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  const notice = screen.getByRole("status");
  await expect(notice).toContainText("손상되었거나 지원하지 않는 형식");

  for (const selector of ["h1", ".data-transfer-actions", ".data-transfer-notice"]) {
    const bounds = await screen.evaluate((element, targetSelector) => {
      const screenBounds = element.getBoundingClientRect();
      const target = element.querySelector(targetSelector);
      if (!target) return null;
      const targetBounds = target.getBoundingClientRect();
      return { top: targetBounds.top, bottom: targetBounds.bottom, screenTop: screenBounds.top, screenBottom: screenBounds.bottom };
    }, selector);
    expect(bounds, `${selector} exists`).not.toBeNull();
    expect(bounds!.top).toBeGreaterThanOrEqual(bounds!.screenTop);
    expect(bounds!.bottom).toBeLessThanOrEqual(bounds!.screenBottom);
  }
  await expectNoOuterScroll(page);
});

test("library and settings navigation reveal the focused row without moving the document", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "짧은 글" }).click();

  const library = page.locator(".activity-menu");
  await expect(library.evaluate((element) => element.scrollHeight > element.clientHeight)).resolves.toBe(true);
  await page.keyboard.press("Home");
  await page.keyboard.press("PageDown");
  const pagedPassage = library.locator("button:focus");
  expect(await pagedPassage.evaluate((button) =>
    Array.from(button.parentElement!.querySelectorAll("button")).indexOf(button),
  )).toBeGreaterThan(0);
  await expect(pagedPassage).toBeFocused();
  await expectInsideRegion(pagedPassage, library);
  await page.keyboard.press("End");
  const lastPassage = library.locator("button").last();
  await expect(lastPassage).toBeFocused();
  await expectInsideRegion(lastPassage, library);
  await expectNoOuterScroll(page);

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "환경설정" }).click();
  const settings = page.locator(".settings-menu");
  await expect(settings.evaluate((element) => element.scrollHeight > element.clientHeight)).resolves.toBe(true);
  await page.keyboard.press("End");
  const lastSetting = settings.locator("[data-setting-row]").last();
  await expect(lastSetting).toBeFocused();
  await expectInsideRegion(lastSetting, settings);
  await expectNoOuterScroll(page);
});

test("the current passage line stays visible in its keyboard-accessible context region", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  const size = page.getByRole("button", { name: /연습 글자 크기/ });
  await size.click();
  await size.click();
  await page.getByRole("button", { name: "← 메뉴" }).click();

  const passage = passagesFor("ko", "long")[0]!;
  await page.getByRole("button", { name: "긴 글" }).click();
  await page.getByRole("button", { name: new RegExp(passage.label) }).click();
  const context = page.getByRole("region", { name: /묶음/ });
  await expect(context.evaluate((element) => element.scrollHeight > element.clientHeight)).resolves.toBe(true);
  await expectInsideRegion(context.locator("li.current"), context);
  await context.focus();
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => context.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await context.evaluate((element) => { element.scrollTop = 0; });

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  for (const line of passage.lines.slice(0, 5)) {
    const currentLine = context.locator("li.current");
    await expectIntersectsRegion(currentLine, context);
    await input.fill(line);
    await input.press("Space");
  }
  await expectNoOuterScroll(page);
});

test("practice controls fit in the minimum viewport with the largest prompt text", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  const size = page.getByRole("button", { name: /연습 글자 크기/ });
  await size.click();
  await size.click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "한 줄", exact: true }).click();

  const screen = page.locator(".practice-screen");
  const clipped = await screen.evaluate((element) => {
    const screenRect = element.getBoundingClientRect();
    const required = ["h1", "#typing-target", "#typing-input", ".practice-actions", ".scores"];
    return Object.fromEntries(required.map((selector) => {
      const target = element.querySelector(selector);
      if (!target) return [selector, false];
      const bounds = target.getBoundingClientRect();
      return [selector, bounds.top >= screenRect.top && bounds.bottom <= screenRect.bottom];
    }));
  });
  expect(clipped).toEqual({
    h1: true,
    "#typing-target": true,
    "#typing-input": true,
    ".practice-actions": true,
    ".scores": true,
  });
  await expect(screen.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).resolves.toBe(true);
  await expectNoOuterScroll(page);

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  await page.getByRole("button", { name: "30초 낱말 도전", exact: true }).click();
  await page.getByRole("button", { name: "도전 시작" }).click();
  const challenge = page.locator(".challenge-running-screen");
  await expect(challenge.locator("#typing-target")).toBeVisible();
  await expect(challenge.getByRole("textbox", { name: "따라 입력하기" })).toBeVisible();
  await expect(challenge.locator(".practice-actions")).toBeVisible();
  await expect(challenge.evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).resolves.toBe(true);
  await expectNoOuterScroll(page);
});

test("long history is a keyboard and pointer scroll region", async ({ page }) => {
  await page.addInitScript((key) => {
    const score = {
      accuracy: 100,
      correctCount: 4,
      typedCount: 4,
      elapsedMs: 2_000,
      charactersPerMinute: null,
      keystrokeCount: 4,
      keystrokesPerMinute: 120,
    };
    localStorage.setItem(key, JSON.stringify({
      version: 3,
      records: Array.from({ length: 100 }, (_, index) => ({
        id: `viewport-${index}`,
        materialId: "viewport-layout",
        completedAt: index + 1,
        mode: "line",
        language: "ko",
        score,
      })),
    }));
  }, historyKey);
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();

  const history = page.getByRole("region", { name: "최근 연습 기록" });
  await expect(history.locator("li")).toHaveCount(100);
  await expect(history.evaluate((element) => element.scrollHeight > element.clientHeight)).resolves.toBe(true);
  await history.focus();
  await page.keyboard.press("End");
  const keyboardScrollTop = await history.evaluate((element) => element.scrollTop);
  expect(keyboardScrollTop).toBeGreaterThan(0);
  await history.evaluate((element) => { element.scrollTop = 0; });
  const historyBounds = await history.boundingBox();
  expect(historyBounds).not.toBeNull();
  await page.mouse.move(historyBounds!.x + historyBounds!.width / 2, historyBounds!.y + historyBounds!.height / 2);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => history.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expectNoOuterScroll(page);
});

test("Venice keeps its play controls visible and resizes the board with the window", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  await page.getByRole("button", { name: "베네치아", exact: true }).click();
  await page.getByRole("button", { name: "게임 시작" }).click();

  const board = page.locator(".venice-board");
  const initialHeight = await board.evaluate((element) => element.getBoundingClientRect().height);
  await expect(page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" })).toBeVisible();
  await expect(page.getByRole("button", { name: "게임 일시 정지" })).toBeVisible();
  await expectNoOuterScroll(page);

  await page.setViewportSize({ width: 1280, height: 720 });
  await expect.poll(() => board.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(initialHeight);
  await expect(page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" })).toBeVisible();
  await expectNoOuterScroll(page);
});

test("Venice Top 10 stays inside a keyboard and pointer scroll region", async ({ page }) => {
  const records = Array.from({ length: 10 }, (_, index) => ({
    id: `viewport-top-${index}`,
    rulesVersion: veniceRulesVersion,
    startedAt: 1_000 + index,
    completedAt: 6_000 + index,
    startLevel: 1,
    highestLevel: 1,
    score: 1_000 - index,
    typedWords: 8,
    missedWords: 2,
    durationMs: 5_000,
    levelStats: [{ level: 1, spawned: 10, typedCorrectly: 8, missed: 2, durationMs: 5_000 }],
  }));
  await page.addInitScript(({ key, version, rulesVersion, records: topScores }) => {
    localStorage.setItem(key, JSON.stringify({ version, rulesVersion, recentRuns: [], topScores }));
  }, { key: veniceStorageKey, version: veniceStorageVersion, rulesVersion: veniceRulesVersion, records });
  await page.clock.install();
  await page.setViewportSize({ width: 760, height: 560 });
  await page.goto("/");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  await page.getByRole("button", { name: "베네치아", exact: true }).click();
  await page.getByRole("button", { name: "게임 시작" }).click();
  await page.clock.runFor(3_500);
  const input = page.getByRole("textbox", { name: "보이는 낱말을 입력하세요" });
  const word = (await page.locator(".venice-falling-word").first().textContent())?.trim();
  expect(word).toBeTruthy();
  await input.fill(word!);
  await input.press("Enter");
  await page.getByRole("button", { name: "게임 마치기" }).click();

  const table = page.getByRole("region", { name: "로컬 Top 10 하이스코어" });
  await expect(table.locator("tbody tr")).toHaveCount(10);
  await expect(table.evaluate((element) => element.scrollHeight > element.clientHeight)).resolves.toBe(true);
  await table.focus();
  await page.keyboard.press("End");
  await expect.poll(() => table.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await table.evaluate((element) => { element.scrollTop = 0; });
  const bounds = await table.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => table.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expectNoOuterScroll(page);
});
