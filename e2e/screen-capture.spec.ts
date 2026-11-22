import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const pngSignature = Buffer.from("89504e470d0a1a0a", "hex");

async function expectPngDownload(page: Page, action: () => Promise<void>) {
  const downloadPromise = page.waitForEvent("download");
  await action();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^tagak-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  const image = await readFile(path!);
  expect(image.subarray(0, pngSignature.length)).toEqual(pngSignature);
  expect(image.byteLength).toBeGreaterThan(1_000);
}

test("the screen button downloads the current screen as PNG", async ({ page }) => {
  await page.goto("/");
  await expectPngDownload(page, () => page.getByRole("button", { name: /화면 저장/ }).click());
  await expect(page.locator(".capture-status")).toHaveText("화면을 PNG로 저장했습니다.");
});

test("the downloaded PNG uses the active color theme background", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 환경설정" }).click();
  await page.getByRole("button", { name: /색상 테마/ }).click();
  const expectedBackground = await page.locator(".shell").evaluate((root) => getComputedStyle(root).backgroundColor);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /화면 저장/ }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const image = await readFile(path!);
  const pixel = await page.evaluate(async (dataUrl) => {
    const rendered = new Image();
    rendered.src = dataUrl;
    await rendered.decode();
    const canvas = document.createElement("canvas");
    canvas.width = rendered.naturalWidth;
    canvas.height = rendered.naturalHeight;
    const context = canvas.getContext("2d");
    if (context === null) throw new Error("Canvas context is unavailable.");
    context.drawImage(rendered, 0, 0);
    const x = Math.max(0, rendered.naturalWidth - 10);
    const y = Math.floor(rendered.naturalHeight / 2);
    return Array.from(context.getImageData(x, y, 1, 1).data);
  }, `data:image/png;base64,${image.toString("base64")}`);
  const expectedPixel = expectedBackground.match(/[\d.]+/g)?.map(Number).slice(0, 3);

  expect(expectedPixel).toEqual([255, 253, 248]);
  expect(pixel).toEqual([...expectedPixel!, 255]);
});

test("the platform save shortcut downloads the current screen while free practice text remains in the editor", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 연습장" }).click();
  const editor = page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" });
  const text = "화면에 보이는 연습장 입력\n둘째 줄";
  await editor.fill(text);

  const shortcut = await page.evaluate(() => navigator.platform.startsWith("Mac") ? "Meta+s" : "Control+s");
  await expectPngDownload(page, () => page.keyboard.press(shortcut));
  await expect(editor).toHaveValue(text);
  await expect(page.locator(".capture-status")).toHaveText("화면을 PNG로 저장했습니다.");
});

test("the platform save shortcut does not intercept a shortcut during IME composition", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 연습장" }).click();
  const editor = page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" });
  const wasPrevented = await editor.evaluate((element) => {
    element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    const shortcut = new KeyboardEvent("keydown", {
      key: "s",
      code: "KeyS",
      metaKey: navigator.platform.startsWith("Mac"),
      ctrlKey: !navigator.platform.startsWith("Mac"),
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(shortcut);
    element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    return shortcut.defaultPrevented;
  });

  expect(wasPrevented).toBe(false);
  await expect(page.locator(".capture-status")).toBeEmpty();
});

test("the app announces a PNG encoding failure and remains usable", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = (callback) => callback(null);
  });
  const save = page.getByRole("button", { name: /화면 저장/ });
  await save.click();

  await expect(page.locator(".capture-status")).toHaveText("화면을 저장하지 못했습니다. 다시 시도하세요.");
  await expect(save).toBeEnabled();
});
