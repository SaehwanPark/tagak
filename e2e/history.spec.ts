import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { historyKey } from "../src/storage/historyStorage";

async function finishLine(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  await input.fill(prompt!);
  await input.press("Enter");
  await page.getByRole("button", { name: "연습 마치기" }).click();
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();
}

async function openHistory(page: Page) {
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();
}

test("history keeps readable records from removed practice modes", async ({ page }) => {
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
      records: [
        { id: "legacy-position", materialId: "legacy-position", completedAt: 2, mode: "position", language: "ko", score },
        { id: "legacy-word", materialId: "legacy-word", completedAt: 1, mode: "word", language: "ko", score },
      ],
    }));
  }, historyKey);
  await page.goto("/");

  await openHistory(page);
  await expect(page.locator(".history-list li")).toHaveCount(2);
  await expect(page.locator(".history-list li").nth(0)).toContainText("자리");
  await expect(page.locator(".history-list li").nth(1)).toContainText("낱말");
  await page.getByRole("button", { name: "← 환경설정" }).click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await expect(page.locator(".home-menu-screen .activity-menu button"))
    .toHaveText(["한 줄↵", "짧은 글↵", "긴 글↵", "게임↵", "환경설정↵"]);
});

test("simultaneous completions persist across tabs and can be compared and cleared", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  const other = await context.newPage();
  await Promise.all([finishLine(page), finishLine(other)]);
  await expect.poll(async () => await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).records.length : 0;
  }, historyKey)).toBe(2);

  await finishLine(page);
  await expect(page.getByRole("heading", { name: "같은 모드의 이전 기록" })).toBeVisible();
  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await openHistory(page);
  await expect(page.getByRole("listitem")).toHaveCount(3);
  await page.getByRole("combobox").selectOption("long");
  await expect(page.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
  await page.getByRole("button", { name: "기록 지우기", exact: true }).click();
  await page.getByRole("button", { name: "전체 기록 지우기" }).click();
  await expect(page.getByRole("status")).toContainText("기록을 지웠습니다");
  await other.goto("/");
  await openHistory(other);
  await expect(other.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
});

test("history clear confirmation starts on Cancel and restores the clear button", async ({ page }) => {
  await finishLine(page);
  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await openHistory(page);

  const clearButton = page.getByRole("button", { name: "기록 지우기", exact: true });
  await clearButton.click();
  const cancel = page.getByRole("button", { name: "취소" });
  await expect(cancel).toBeFocused();
  await expect(page.getByRole("alertdialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(clearButton).toBeFocused();
  await expect(page.getByRole("listitem")).toHaveCount(1);

  await clearButton.click();
  await expect(cancel).toBeFocused();
  await cancel.click();
  await expect(clearButton).toBeFocused();
  await expect(page.getByRole("listitem")).toHaveCount(1);
});

test("unreadable data is preserved and a session still completes", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.setItem(key, "unreadable"), historyKey);
  await finishLine(page);
  await expect(page.getByRole("status")).toContainText("이번 기록은 저장하지 못했습니다");
  await expect(page.getByText("100%")).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), historyKey)).toBe("unreadable");
});

test("a failed write leaves the score available in the current page", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage is full", "QuotaExceededError"); };
  });
  await finishLine(page);
  await expect(page.getByRole("status")).toContainText("이번 기록은 저장하지 못했습니다");
  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await openHistory(page);
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await page.reload();
  await openHistory(page);
  await expect(page.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
});
