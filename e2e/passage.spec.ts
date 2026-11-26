import { expect, test } from "@playwright/test";
import { passagesFor } from "../src/content/passages";
import { seedPreferences } from "./helpers/preferences";
import { stubCompletionTone } from "./helpers/audio";
import { historyKey } from "../src/storage/historyStorage";

test("short passage lines advance in five-line pages and return to the selected passage", async ({ page }) => {
  const passage = passagesFor("ko", "short")[0]!;
  await page.goto("/");
  const library = page.getByRole("button", { name: "짧은 글" });
  await library.click();
  const entry = page.getByRole("button", { name: /새벽 강변/ });
  await expect(entry).toBeFocused();
  await entry.press("Enter");

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  for (const [index, line] of passage.lines.entries()) {
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");
    await expect(page.locator(".passage-page li")).toHaveCount(Math.min(5, passage.lines.length - Math.floor(index / 5) * 5));
    await expect(page.locator(".passage-page li.current")).toHaveText(new RegExp(line));
    await input.fill(line);
    await input.press("Space");
  }
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
  await expect(page.getByText("100%")).toBeVisible();
  await expect(page.locator(".line-session-statistics")).toBeVisible();
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return stored?.sessions?.length ?? 0;
  }, historyKey)).toBe(1);
  const sessionData = await page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return stored.sessions[0];
  }, historyKey);
  expect(sessionData).toMatchObject({ mode: "short", completion: "completed", lineScores: Array(passage.lines.length).fill(expect.any(Object)) });
  await page.keyboard.press("Escape");
  await expect(entry).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(library).toBeFocused();
});

test("a passage exited after submitted lines stays in session history without a high score", async ({ page }) => {
  const passage = passagesFor("ko", "short")[0]!;
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "짧은 글" }).click();
  await page.getByRole("button", { name: /새벽 강변/ }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.fill(passage.lines[0]!);
  await page.clock.fastForward(1_200);
  await input.press("Space");
  await input.press("Escape");
  await page.getByRole("button", { name: "연습 종료" }).click();
  await expect(page.getByRole("heading", { name: "짧은 글 고르기" })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key) ?? "null");
    return stored?.sessions?.length ?? 0;
  }, historyKey)).toBe(1);
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), historyKey);
  expect(stored.sessions[0]).toMatchObject({ mode: "short", completion: "early-exit", lineScores: [expect.any(Object)] });
  expect(stored.highScores).toEqual([]);
});

test("long passages expose five-line pages and their genre and size", async ({ page }) => {
  const passage = passagesFor("ko", "long")[0]!;
  await page.goto("/");
  await page.getByRole("button", { name: "긴 글" }).click();
  const entry = page.getByRole("button", { name: new RegExp(passage.label) });
  await expect(entry).toContainText(`${passage.characterCount}자`);
  await entry.click();
  await expect(page.getByText("1 / " + Math.ceil(passage.lines.length / 5) + " 묶음")).toBeVisible();
  await expect(page.locator(".passage-page li.current")).toHaveText(new RegExp(passage.lines[0]!));
  await page.getByRole("textbox", { name: "따라 입력하기" }).fill(passage.lines[0]!);
  await page.getByRole("textbox", { name: "따라 입력하기" }).press("Space");
  await expect(page.locator(".passage-page li.done")).toHaveCount(1);
  await expect(page.locator(".passage-page li.current")).toHaveText(new RegExp(passage.lines[1]!));
});

test("bundle speed and completion sound appear only when a five-line bundle ends", async ({ page }) => {
  const passage = passagesFor("ko", "short")[0]!;
  await seedPreferences(page, {
    interfaceLanguage: "ko", practiceLanguage: "ko", completionSound: true,
    typingSpeedUnits: { ko: "cpm", en: "wpm" },
  });
  const tones = await stubCompletionTone(page);

  await page.goto("/");
  await page.getByRole("button", { name: "짧은 글" }).click();
  await page.getByRole("button", { name: /새벽 강변/ }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });

  for (let index = 0; index < 4; index += 1) {
    await input.fill(passage.lines[index]!);
    await expect(page.locator(".previous-score")).toHaveCount(0);
    await input.press("Space");
  }
  await expect(page.locator(".previous-score")).toHaveCount(0);
  await expect.poll(tones).toBe(0);

  await input.fill(passage.lines[4]!);
  await input.press("Space");
  const bundle = page.locator(".previous-score");
  await expect(bundle).toBeVisible();
  await expect(bundle.getByRole("heading")).toHaveText("완료한 묶음");
  await expect(bundle.locator("dt")).toHaveCount(2);
  await expect(bundle.locator("dt").nth(1)).toHaveText("타수/분");
  await expect.poll(tones).toBe(1);

  await input.fill(passage.lines[5]!);
  await input.press("Space");
  await expect.poll(tones).toBe(1);
});

test("copied passages show their author, source, and license in the list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "짧은 글" }).click();
  const entry = page.getByRole("button", { name: /운수 좋은 날/ });
  await expect(entry).toContainText("현진건 · 한국어 위키문헌 · CC BY-SA 4.0");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "긴 글" }).click();
  await expect(page.getByRole("button", { name: /날개/ })).toContainText("이상 · 한국어 위키문헌");
});
