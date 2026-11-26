import { expect, test } from "@playwright/test";

test("challenge can submit, stop, retry, and end automatically", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  const menu = page.getByRole("button", { name: "30초 낱말 도전", exact: true });
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
  await expect(page.locator(".challenge-running-screen [role='status']").last()).toContainText("같은지 확인");
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

test("challenge pauses while settings or the app window is inactive", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "게임", exact: true }).click();
  await page.getByRole("button", { name: "30초 낱말 도전", exact: true }).click();
  await page.getByRole("button", { name: "도전 시작" }).click();
  await expect(page.getByText("남은 시간 30초")).toBeVisible();

  await page.clock.fastForward(5_000);
  await expect(page.getByText("남은 시간 25초")).toBeVisible();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const word = (await page.locator("#typing-target").textContent())?.trim();
  expect(word).toBeTruthy();
  const partialInput = word!.slice(0, 1);
  await input.evaluate((element, partial) => {
    if (!(element instanceof HTMLInputElement)) return;
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: partial }));
    element.value = partial;
    element.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      data: partial,
      inputType: "insertCompositionText",
      isComposing: true,
    }));
  }, partialInput);
  await page.locator(".settings-shortcut").click();
  await expect(page.getByRole("heading", { name: "환경설정" })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("blur"));
    window.dispatchEvent(new Event("blur"));
  });
  await page.clock.fastForward(20_000);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  await page.clock.fastForward(5_000);
  await page.getByRole("button", { name: "← 뒤로" }).click();
  await expect(page.getByText("남은 시간 25초")).toBeVisible();
  await input.evaluate((element, partial) => {
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: partial }));
  }, partialInput);
  await expect(input).toHaveValue(partialInput);

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("blur"));
    window.dispatchEvent(new Event("blur"));
  });
  await expect(page.getByText("도전 시간이 멈췄습니다. 앱으로 돌아오면 이어집니다.")).toBeVisible();
  await page.clock.fastForward(20_000);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  await expect(page.getByText("환경설정 화면을 열거나 앱 창이 비활성 상태가 되면 제한 시간이 멈춥니다.")).toBeVisible();
  await expect(page.getByText("남은 시간 25초")).toBeVisible();

  await page.clock.fastForward(5_000);
  await expect(page.getByText("남은 시간 20초")).toBeVisible();
  await page.getByRole("button", { name: "중단" }).click();
  await expect(page.locator(".scores dd").last()).toHaveText(/^10\.[0-9]초$/);
});
