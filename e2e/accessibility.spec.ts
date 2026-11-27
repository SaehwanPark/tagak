import { expect, test } from "@playwright/test";

test("current, correct, and wrong characters are distinguishable beyond color", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();

  const target = page.locator("#typing-target");
  const prompt = await target.getAttribute("aria-label");
  expect(prompt).toBeTruthy();
  const characters = Array.from(prompt!);
  const wrongCharacter = characters[2] === "가" ? "나" : "가";
  await page.getByRole("textbox", { name: "따라 입력하기" })
    .fill(characters.slice(0, 2).join("") + wrongCharacter);

  const current = target.locator("span.current");
  const correct = target.locator("span.correct");
  const wrong = target.locator("span.wrong");
  await expect(current).toHaveCount(1);
  await expect(correct).toHaveCount(2);
  await expect(wrong).toHaveCount(1);

  const currentStyle = await current.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, border: style.borderBottomWidth };
  });
  expect(currentStyle.border).toBe("2px");
  expect(currentStyle.background).not.toBe("rgba(0, 0, 0, 0)");

  const correctStyle = await correct.first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { line: style.textDecorationLine, decoration: style.textDecorationStyle };
  });
  expect(correctStyle.line).toContain("underline");
  expect(correctStyle.decoration).toBe("solid");

  const wrongStyle = await wrong.first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { line: style.textDecorationLine, decoration: style.textDecorationStyle };
  });
  expect(wrongStyle.line).toContain("underline");
  expect(wrongStyle.decoration).toBe("wavy");
});

test("one-line practice stays usable at 200% zoom", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await expect(input).toBeFocused();

  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });

  const target = page.locator("#typing-target");
  await expect(target).toBeVisible();
  await expect(target.locator("span.current")).toHaveCount(1);
  await expect(input).toBeVisible();
  const box = await input.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width + 1);

  await input.fill("가");
  await expect(target.locator("span.correct, span.wrong")).toHaveCount(1);
});
