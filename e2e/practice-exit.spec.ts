import { expect, test } from "@playwright/test";
import { historyKey } from "../src/storage/historyStorage";

const partialInput = "가나다라마바사아자차";

test("empty practice returns immediately while meaningful partial input asks first", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 420 });
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });

  await input.press("Escape");
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const activeInput = page.getByRole("textbox", { name: "따라 입력하기" });
  await activeInput.fill(partialInput);
  await page.locator(".practice-screen .back").click();

  const dialog = page.getByRole("dialog", { name: "연습을 끝낼까요?" });
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(320);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(420);
  const continueButton = page.getByRole("button", { name: "계속 연습" });
  await expect(continueButton).toBeFocused();
  await expect(dialog).toContainText("미제출 입력은 저장되지 않고");

  await page.keyboard.press("Enter");
  await expect(dialog).toHaveCount(0);
  await expect(activeInput).toBeFocused();
  await expect(activeInput).toHaveValue(partialInput);
});

test("composing Escape is ignored and confirming an early exit preserves submitted lines", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });

  await input.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
      code: "Escape",
      isComposing: true,
      keyCode: 229,
    }));
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "" }));
    element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Escape", code: "Escape", keyCode: 229 }));
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(input).toBeFocused();

  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  await input.fill(prompt!);
  await input.press("Enter");
  await expect(input).toHaveValue(prompt!);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await input.fill(partialInput);
  await input.press("Escape");

  const dialog = page.getByRole("dialog", { name: "연습을 끝낼까요?" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "계속 연습" })).toBeFocused();
  const repeatedEscape = await dialog.evaluate((element) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
      code: "Escape",
      repeat: true,
    });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(repeatedEscape).toBe(true);
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue(partialInput);
  await page.locator(".practice-screen .back").click();
  await page.getByRole("button", { name: "연습 종료" }).click();

  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  await expect.poll(() => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const history = JSON.parse(raw) as { sessions?: { completion: string }[] };
    return history.sessions?.at(-1)?.completion ?? null;
  }, historyKey)).toBe("early-exit");
  const highScores = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return (JSON.parse(raw) as { highScores?: unknown[] }).highScores ?? [];
  }, historyKey);
  expect(highScores).toEqual([]);
});

test("short and long passages protect partial input and restore it on cancel", async ({ page }) => {
  await page.goto("/");

  for (const label of ["짧은 글", "긴 글"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const passage = page.locator('.activity-menu button[data-activity]:not([data-activity="random-passage"]):not([data-activity="recent-passage"])').first();
    const passageId = await passage.getAttribute("data-activity");
    await passage.click();
    const input = page.getByRole("textbox", { name: "따라 입력하기" });
    await input.fill(partialInput);
    await page.locator(".practice-screen .back").click();
    const dialog = page.getByRole("dialog", { name: "연습을 끝낼까요?" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "계속 연습" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(partialInput);

    await input.press("Escape");
    await page.getByRole("button", { name: "연습 종료" }).click();
    await expect(page.locator(`.activity-menu button[data-activity="${passageId}"]`)).toBeFocused();
    await page.locator(".screen .back").click();
  }
});
