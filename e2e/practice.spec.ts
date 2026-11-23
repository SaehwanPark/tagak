import { expect, test } from "@playwright/test";
import { activities } from "../src/content/library";
import { linePracticeSessionLength } from "../src/app/usePractice";
import { shuffleWithSeed } from "../src/domain/random";
import { countKoreanKeystrokes } from "../src/domain/typing";

test("a new profile can practice from the build with only loopback access", async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.origin === baseURL ? route.continue() : route.abort();
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "[연습] 두벌식 자리 연습" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("button", { name: "[연습] 한 줄", exact: true });
  await expect(menu).toBeFocused();
  await page.keyboard.press("Enter");

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  await expect(input).toBeFocused();
  const firstPrompt = await target.getAttribute("aria-label");
  expect(firstPrompt).not.toBeNull();
  await input.fill(firstPrompt!.slice(0, 1));
  await input.press("Enter");
  await expect(page.getByRole("status")).toContainText("남았습니다");

  await input.fill(firstPrompt! + "!");
  await expect(page.locator(".target .wrong")).toHaveText("!");
  await input.press("Backspace");
  await expect(page.locator(".target .wrong")).toHaveCount(0);
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
  const secondPrompt = await target.getAttribute("aria-label");
  expect(secondPrompt).not.toBe(firstPrompt);
  await expect(page.getByText("100%")).toBeVisible();
  await page.getByRole("button", { name: "연습 마치기" }).click();
  const result = page.getByRole("heading", { name: "연습 완료" });
  await expect(result).toBeFocused();
  await expect(page.getByText("100%")).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await input.press("Escape");
  await expect(menu).toBeFocused();
});

test("one-line practice shows compact source attribution", async ({ page }) => {
  const koreanLines = activities.find((activity) => activity.id === "ko-line");
  if (koreanLines?.kind !== "line") throw new Error("Korean one-line content is unavailable");

  const quoteSeed = Array.from({ length: 1_000 }, (_, index) => index + 1).find((seed) =>
    shuffleWithSeed(koreanLines.lessons, seed).slice(0, linePracticeSessionLength)
      .some((lesson) => lesson.source === "quote"));
  if (quoteSeed === undefined) throw new Error("Could not find a seed with a quote in the first 20 lessons");
  await page.addInitScript((seed) => {
    Object.defineProperty(window.crypto, "getRandomValues", {
      configurable: true,
      value: (values: Uint32Array) => {
        values[0] = seed;
        return values;
      },
    });
  }, quoteSeed);

  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  const credit = page.locator(".practice-credit");
  const quoteUrls = new Set(koreanLines.lessons
    .filter((lesson) => lesson.source === "quote")
    .map((lesson) => lesson.credit?.url));
  const sourceLink = credit.locator("a");

  for (let attempt = 0; attempt < linePracticeSessionLength; attempt += 1) {
    if (await sourceLink.count() > 0) {
      const href = await sourceLink.getAttribute("href");
      if (href && quoteUrls.has(href)) break;
    }
    const prompt = await target.getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await input.press("Enter");
  }

  const href = await sourceLink.getAttribute("href");
  const sourceText = await credit.textContent();
  const displayedQuote = koreanLines.lessons.find((lesson) =>
    lesson.source === "quote" && lesson.credit?.url === href && sourceText?.includes(lesson.credit.author)
      && sourceText.includes(lesson.credit.source));
  expect(displayedQuote).toBeDefined();
  await expect(sourceLink).toHaveAttribute("target", "_blank");
  await expect(credit).toHaveCSS("font-size", "12.8px");
});

test("one-line practice completes its 20-sentence session with speed statistics", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  for (let completed = 0; completed < linePracticeSessionLength; completed += 1) {
    await expect(page.getByText(`문장 ${completed + 1} / ${linePracticeSessionLength}`)).toBeVisible();
    const prompt = await target.getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await page.clock.fastForward(2_000);
    await input.press("Enter");
  }

  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
  await expect(page.getByText("한 줄 연습 세션")).toBeVisible();
  await expect(page.getByText("20문장 완료")).toBeVisible();
  await expect(page.getByText("통계에 포함된 속도 20개")).toBeVisible();
  const statistics = page.locator(".line-session-statistics .scores");
  await expect(statistics.locator("dt")).toHaveText(["평균", "표준편차", "중간값", "IQR"]);
});

test("IME composition and its Enter are processed separately from submission", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  const originalPrompt = await target.getAttribute("aria-label");
  const originalTitle = await page.locator("h1").textContent();
  expect(originalPrompt).not.toBeNull();

  await input.evaluate((element, text) => {
    const field = element as HTMLInputElement;
    field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field.value = text;
    field.dispatchEvent(new InputEvent("input", { isComposing: true, bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Process", code: "Enter", bubbles: true }));
  }, originalPrompt!);
  await expect(page.getByText("100%")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);
  await expect(page.getByRole("status")).toBeEmpty();

  await input.dispatchEvent("compositionend", { bubbles: true });
  await expect(page.getByText("100%")).toBeVisible();
  await input.dispatchEvent("keyup", { key: "Enter", code: "Enter", bubbles: true });
  await input.dispatchEvent("keydown", { key: "Enter", code: "Enter", bubbles: true });
  await expect(page.getByRole("heading", { name: originalTitle! })).toBeVisible();
  await input.dispatchEvent("keyup", { key: "Enter", code: "Enter", bubbles: true });
  await input.press("Enter");
  await expect(input).toHaveValue("");
  expect(await target.getAttribute("aria-label")).not.toBe(originalPrompt);
});

test("Korean sentence Space submits only after the prompt is complete", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  const originalPrompt = await target.getAttribute("aria-label");
  const originalTitle = await page.locator("h1").textContent();
  expect(originalPrompt).not.toBeNull();

  await input.fill("한글을");
  await input.press("Space");
  await expect(input).toHaveValue("한글을 ");
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: originalTitle! })).toBeVisible();
  await expect(target).toHaveAttribute("aria-label", originalPrompt!);

  await input.fill(originalPrompt!);
  await input.press("Space");
  await expect(input).toHaveValue("");
  expect(await target.getAttribute("aria-label")).not.toBe(originalPrompt);
});

test("live score shows accuracy only and speed appears once the line is submitted", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();

  const currentScore = page.locator(".scores").first();
  await input.fill(prompt!.slice(0, 2));
  await expect(currentScore.locator("dt")).toHaveCount(1);
  await expect(currentScore.locator("dt")).toHaveText("정확도");

  await input.fill(prompt!);
  await expect(currentScore.locator("dt")).toHaveCount(1);
  await input.press("Enter");

  const previousScore = page.locator(".previous-score .scores");
  await expect(previousScore.locator("dt")).toHaveCount(2);
  await expect(previousScore.locator("dt").nth(1)).toHaveText("타수/분");
});

test("Korean CPM displays two-set keystrokes per minute", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  const expectedSpeed = Math.round(countKoreanKeystrokes(prompt!) * 30);

  await input.fill(prompt!);
  await page.clock.fastForward(2_000);
  await input.press("Enter");

  await expect(page.locator(".previous-score .scores dt").nth(1)).toHaveText("타수/분");
  const displayedSpeed = Number(await page.locator(".previous-score .scores dd").nth(1).textContent());
  expect(displayedSpeed).toBeGreaterThanOrEqual(Math.floor(expectedSpeed * 0.95));
  expect(displayedSpeed).toBeLessThanOrEqual(Math.ceil(expectedSpeed * 1.05));
});

test("a Space key used to complete Korean IME input submits once", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  const originalPrompt = await target.getAttribute("aria-label");
  expect(originalPrompt).not.toBeNull();

  await input.evaluate((element, text) => {
    const field = element as HTMLInputElement;
    field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field.value = text;
    field.dispatchEvent(new InputEvent("input", { isComposing: true, bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keydown", {
      key: " ", code: "Space", isComposing: true, bubbles: true,
    }));
  }, originalPrompt!);
  await input.dispatchEvent("compositionend", { bubbles: true });
  await expect(input).toHaveValue("");
  const nextPrompt = await target.getAttribute("aria-label");
  expect(nextPrompt).not.toBe(originalPrompt);

  await input.dispatchEvent("keydown", { key: " ", code: "Space", bubbles: true });
  await expect(target).toHaveAttribute("aria-label", nextPrompt!);
  await input.dispatchEvent("keyup", { key: " ", code: "Space", bubbles: true });
  await input.press("Space");
  await expect(target).toHaveAttribute("aria-label", nextPrompt!);
  await expect(input).toHaveValue(" ");
});

test("an IME-ending Space inserts one separator while the prompt continues", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  const prefixAndComposition = Array.from(prompt!).slice(0, 3).join("");

  await input.evaluate((element, text) => {
    const field = element as HTMLInputElement;
    field.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field.value = text;
    field.setSelectionRange(text.length, text.length);
    field.dispatchEvent(new InputEvent("input", { isComposing: true, bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keydown", {
      key: " ", code: "Space", isComposing: true, bubbles: true,
    }));
  }, prefixAndComposition);
  await input.dispatchEvent("compositionend", { bubbles: true });
  await expect(input).toHaveValue(prefixAndComposition + " ");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);

  await input.dispatchEvent("keydown", { key: " ", code: "Space", bubbles: true });
  await expect(input).toHaveValue(prefixAndComposition + " ");
  await input.dispatchEvent("keyup", { key: " ", code: "Space", bubbles: true });
});

test("Space submits completed Korean and English practice tasks", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 낱말", exact: true }).click();
  const koreanWordInput = page.getByRole("textbox", { name: "따라 입력하기" });
  const koreanWordPrompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(koreanWordPrompt).not.toBeNull();
  const partialWord = Array.from(koreanWordPrompt!).slice(0, -1).join("");
  await koreanWordInput.fill(partialWord);
  await koreanWordInput.press("Space");
  await expect(koreanWordInput).toHaveValue(partialWord + " ");
  await koreanWordInput.fill(koreanWordPrompt!);
  await koreanWordInput.press("Space");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();

  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await page.getByRole("button", { name: "[기타] 환경설정" }).click();
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "[연습] 한 줄", exact: true }).click();
  const englishSentenceInput = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  await englishSentenceInput.fill(prompt!);
  await englishSentenceInput.press("Space");
  await expect(englishSentenceInput).toHaveValue("");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toHaveCount(0);

  await englishSentenceInput.press("Escape");
  await page.getByRole("button", { name: "[연습] 낱말", exact: true }).click();
  const englishWordInput = page.getByRole("textbox", { name: "따라 입력하기" });
  const word = await page.locator("#typing-target").getAttribute("aria-label");
  expect(word).not.toBeNull();
  await englishWordInput.fill(word!);
  await englishWordInput.press("Space");
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();
});

test("word practice advances through every word and wraps after the last one", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 낱말" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const words: string[] = [];
  for (let step = 0; step < 8; step += 1) {
    const prompt = await page.locator("#typing-target").getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    words.push(prompt!);
    await input.fill(prompt!);
    await input.press("Enter");
    await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
    await expect(page.locator(".result-progress")).toHaveText(`${step + 1} / 8번째 낱말`);
    await page.keyboard.press("Enter");
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("");
  }
  expect(new Set(words).size).toBe(8);
  await expect(page.locator("#typing-target")).toHaveAttribute("aria-label", words[0]!);
});

test("restarting a word result begins a fresh run", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 낱말" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const first = await page.locator("#typing-target").getAttribute("aria-label");
  await input.fill(first!);
  await input.press("Enter");
  await page.keyboard.press("Enter");
  const second = await page.locator("#typing-target").getAttribute("aria-label");
  expect(second).not.toBe(first);
  await input.fill(second!);
  await input.press("Enter");
  await page.getByRole("button", { name: "다시 연습" }).click();
  await expect(input).toHaveValue("");
  await expect(page.locator("#typing-target")).toHaveAttribute("aria-label", /.+/);
  await expect(page.locator(".result-progress")).toHaveCount(0);
});

test("Home, End, and Page Down jump between menu entries and keep the roving focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 짧은 글", exact: true }).click();
  const entries = page.locator(".activity-menu button");
  const count = await entries.count();
  expect(count).toBeGreaterThan(6);
  await expect(entries.first()).toBeFocused();

  await page.keyboard.press("End");
  await expect(entries.nth(count - 1)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(entries.first()).toBeFocused();

  await page.keyboard.press("PageDown");
  await expect(entries.nth(Math.min(5, count - 1))).toBeFocused();
  await page.keyboard.press("PageUp");
  await expect(entries.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(entries.nth(count - 1)).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "[연습] 짧은 글", exact: true })).toBeFocused();
});

test("arrow navigation selects a language and returns focus to that mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 환경설정" }).click();
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.keyboard.press("ArrowDown");
  const wordMode = page.getByRole("button", { name: "[연습] 낱말", exact: true });
  await expect(wordMode).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("button", { name: "[연습] 한 줄", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(wordMode).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#typing-target")).toBeVisible();
  expect(await page.locator("#typing-target").getAttribute("aria-label")).toBeTruthy();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  await input.press("Escape");
  await expect(wordMode).toBeFocused();
});

test("free practice edits multiline text without scoring or saving it", async ({ page }) => {
  await page.goto("/");
  const practicePad = page.getByRole("button", { name: "[기타] 연습장" });
  const entries = await page.locator(".activity-menu button").evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("data-activity"))
  );
  const practiceIndex = entries.indexOf("free-practice");
  expect(practiceIndex).toBeGreaterThan(0);
  for (let step = 0; step < practiceIndex; step += 1) await page.keyboard.press("ArrowDown");
  await expect(practicePad).toBeFocused();
  await page.keyboard.press("Enter");

  const editor = page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" });
  await expect(editor).toBeFocused();
  await editor.fill("첫 줄\n둘째 줄");
  await editor.press("Enter");
  await expect(editor).toHaveValue("첫 줄\n둘째 줄\n");
  await expect(page.getByRole("button", { name: "제출" })).toHaveCount(0);

  await editor.dispatchEvent("compositionstart", { bubbles: true });
  await editor.press("Escape");
  await expect(page.getByRole("heading", { name: "연습장" })).toBeVisible();
  await editor.dispatchEvent("compositionend", { bubbles: true });
  await editor.press("Escape");
  await expect(practicePad).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(editor).toBeFocused();
  await expect(editor).toHaveValue("");

  await editor.fill("나가면 버려지는 임시 입력");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await expect(practicePad).toBeFocused();
  await page.getByRole("button", { name: "[기타] 최근 연습 기록" }).click();
  await expect(page.getByText("표시할 연습 기록이 없습니다.")).toBeVisible();
});

test("position practice follows physical key codes and includes missed attempts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[연습] 두벌식 자리 연습" }).click();
  const status = page.getByRole("status");
  const targetKey = async () => {
    const text = await status.locator("strong").textContent();
    const letter = text?.split("·")[0]?.trim();
    if (!letter) throw new Error("The current position key is unavailable.");
    return letter.toLowerCase();
  };
  const firstTarget = await targetKey();
  const wrongKey = "qwertyuiopasdfghjklzxcvbnm".split("").find((key) => key !== firstTarget);
  if (!wrongKey) throw new Error("A distinct position key is unavailable.");
  await page.keyboard.press(wrongKey);
  await expect(status).toContainText("다시 시도");
  for (let index = 0; index < 9; index += 1) {
    await page.keyboard.press(await targetKey());
  }
  await expect(page.getByRole("heading", { name: "연습 완료" })).toBeFocused();
  await expect(page.getByText("90%")).toBeVisible();
});
