import { expect, test } from "@playwright/test";

test("challenge can submit, stop, retry, and end automatically", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const menu = page.getByRole("button", { name: "[게임] 30초 낱말 도전" });
  await menu.click();
  const start = page.getByRole("button", { name: "도전 시작" });
  await expect(start).toBeFocused();
  await start.press("Enter");
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  await expect(input).toBeFocused();
  const firstWord = (await target.textContent())?.trim();
  expect(firstWord).toBeTruthy();
  await input.fill(`${firstWord}!`);
  await input.press("Enter");
  await expect(page.getByRole("status")).toContainText("같은지 확인");
  await input.press("Backspace");
  await input.press("Space");
  await expect(input).toHaveValue("");
  const secondWord = (await target.textContent())?.trim();
  expect(secondWord).toBeTruthy();
  expect(secondWord).not.toBe(firstWord);

  await input.press("Escape");
  const result = page.getByRole("heading", { name: "도전 결과" });
  await expect(result).toBeFocused();
  await expect(page.getByText("1개", { exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(target).toHaveText(/.+/);
  await page.clock.fastForward(31_000);
  await expect(result).toBeFocused();
  await expect(page.getByText("시간이 끝났습니다.")).toBeVisible();
  await expect(page.getByText("0개", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
});
