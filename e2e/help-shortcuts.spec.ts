import { expect, test } from "@playwright/test";

test("home help is optional, keyboard accessible, and restores focus", async ({ page }) => {
  await page.goto("/");
  const helpEntry = page.getByRole("button", { name: /사용 안내/ });
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();

  await page.keyboard.press("?");
  const dialog = page.getByRole("dialog", { name: "키보드 사용 안내" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "닫기" })).toBeFocused();
  await expect(dialog).toContainText("한글 IME 조합");
  await expect(dialog).toContainText("5문장");
  await expect(dialog).toContainText("레벨 1");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();

  await helpEntry.click();
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "닫기" }).click();
  await expect(helpEntry).toBeFocused();
});

test("help stays inside a small viewport and its reading region scrolls by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  await page.keyboard.press("?");

  const dialog = page.getByRole("dialog", { name: "키보드 사용 안내" });
  const content = page.locator(".help-dialog-content");
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(320);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(420);

  const initialScroll = await content.evaluate((element) => ({
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }));
  expect(initialScroll.scrollHeight).toBeGreaterThan(initialScroll.clientHeight);
  await content.focus();
  await page.keyboard.press("End");
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
});

test("s and r open Settings and Recent practice directly and return focus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  await page.keyboard.press("r");
  const historyHeading = page.getByRole("heading", { name: "최근 연습 기록" });
  await expect(historyHeading).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "최근 연습 기록" })).toBeFocused();
  await page.keyboard.press("Escape");

  await page.keyboard.press("s");
  const interfaceLanguage = page.getByRole("button", { name: /인터페이스 언어/ });
  await expect(interfaceLanguage).toBeFocused();

  await page.keyboard.press("r");
  await expect(historyHeading).toBeFocused();

  await page.keyboard.press("s");
  await expect(interfaceLanguage).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
});

test("navigation shortcuts are ignored in typing fields and help is localized", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await expect(input).toBeFocused();

  await input.pressSequentially("s");
  await input.press("r");
  await input.press("?");
  await expect(input).toHaveValue("sr?");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /인터페이스 언어/ })).toHaveCount(0);

  await page.keyboard.press("Escape");
  await page.keyboard.press("s");
  const interfaceLanguage = page.getByRole("button", { name: /인터페이스 언어/ });
  await interfaceLanguage.press("ArrowRight");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.keyboard.press("Escape");
  await page.keyboard.press("?");

  const englishHelp = page.getByRole("dialog", { name: "Keyboard help" });
  await expect(englishHelp).toBeVisible();
  await expect(englishHelp).toContainText("Choose 5 sentences");
  await expect(englishHelp).toContainText("level 1");
});
