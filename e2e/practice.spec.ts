import { expect, test } from "@playwright/test";
import { activities } from "../src/content/library";
import { linePracticeSessionLength } from "../src/app/usePractice";
import { shuffleWithSeed } from "../src/domain/random";
import { countKoreanKeystrokes } from "../src/domain/typing";
import { seedPreferences } from "./helpers/preferences";
import { stubCompletionTone } from "./helpers/audio";
import { historyKey } from "../src/storage/historyStorage";

test("a new profile can practice from the build with only loopback access", async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return url.origin === baseURL ? route.continue() : route.abort();
  });
  await page.goto("/");
  const homeEntries = page.locator(".home-menu-screen .activity-menu button");
  await expect(homeEntries).toHaveText(["한 줄↵", "짧은 글↵", "긴 글↵", "게임↵", "환경설정↵"]);
  const menu = page.getByRole("button", { name: "한 줄", exact: true });
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

test("leaving before any submitted line does not create a session record", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  await page.getByRole("textbox", { name: "따라 입력하기" }).press("Escape");
  await expect(page.getByRole("button", { name: "한 줄", exact: true })).toBeFocused();
  const sessions = await page.evaluate(() => {
    const raw = localStorage.getItem("tagak:history");
    return raw ? JSON.parse(raw).sessions ?? [] : [];
  });
  expect(sessions).toEqual([]);
});

test("typing time excludes settings and app inactivity but counts idle time", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  await input.fill(prompt!);
  await page.clock.fastForward(4_000);

  await page.locator(".settings-shortcut").click();
  await expect(page.getByRole("heading", { name: "환경설정" })).toBeVisible();
  await page.clock.fastForward(20_000);
  await page.getByRole("button", { name: "← 뒤로" }).click();
  await expect(input).toHaveValue(prompt!);
  await page.clock.fastForward(2_000);

  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue(prompt!);
  const recordsWhileInactive = await page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    return data?.records ?? [];
  }, historyKey);
  expect(recordsWhileInactive).toEqual([]);
  await page.clock.fastForward(20_000);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.clock.fastForward(2_000);
  await input.press("Enter");

  const elapsedMs = () => page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    return data?.records?.[0]?.score?.elapsedMs ?? null;
  }, historyKey);
  await expect.poll(elapsedMs).toBeGreaterThan(7_000);
  expect(await elapsedMs()).toBeLessThan(10_000);
});

test("one-line practice shows compact source attribution", async ({ page }) => {
  const koreanLines = activities.find((activity) => activity.id === "ko-line");
  if (koreanLines?.kind !== "line") throw new Error("Korean one-line content is unavailable");

  const traditionalSeed = Array.from({ length: 1_000 }, (_, index) => index + 1).find((seed) =>
    shuffleWithSeed(koreanLines.lessons, seed).slice(0, linePracticeSessionLength)
      .some((lesson) => lesson.source === "traditional"));
  if (traditionalSeed === undefined) throw new Error("Could not find a seed with a traditional saying in the first 20 lessons");
  await page.addInitScript((seed) => {
    Object.defineProperty(window.crypto, "getRandomValues", {
      configurable: true,
      value: (values: Uint32Array) => {
        values[0] = seed;
        return values;
      },
    });
  }, traditionalSeed);

  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  const credit = page.locator(".practice-credit");
  const traditionalUrls = new Set(koreanLines.lessons
    .filter((lesson) => lesson.source === "traditional")
    .map((lesson) => lesson.credit?.url));
  const sourceLink = credit.locator("a");

  for (let attempt = 0; attempt < linePracticeSessionLength; attempt += 1) {
    if (await sourceLink.count() > 0) {
      const href = await sourceLink.getAttribute("href");
      if (href && traditionalUrls.has(href)) break;
    }
    const prompt = await target.getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await input.press("Enter");
  }

  const href = await sourceLink.getAttribute("href");
  const sourceText = await credit.textContent();
  const displayedTraditional = koreanLines.lessons.find((lesson) =>
    lesson.source === "traditional" && lesson.credit?.url === href && sourceText?.includes(lesson.credit.author)
      && sourceText.includes(lesson.credit.source));
  expect(displayedTraditional).toBeDefined();
  await expect(sourceLink).toHaveAttribute("target", "_blank");
  await expect(credit).toHaveCSS("font-size", "12.8px");
});

test("one-line practice completes its 20-sentence session with speed statistics", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();

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
  await expect(page.getByText("유효한 속도 20개 중 18개로 통계 계산")).toBeVisible();
  const statistics = page.locator(".line-session-statistics .scores");
  await expect(statistics.locator("dt")).toHaveText(["평균", "표준편차", "중간값", "IQR (P25–P75)"]);
});

test("uses the configured sentence count and reports the trimmed quartile range", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("button", { name: "환경설정" }).click();
  const lineCount = page.getByRole("button", { name: /한 줄 문장 수/ });
  await lineCount.focus();
  await lineCount.press("ArrowLeft");
  await lineCount.press("ArrowLeft");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "한 줄", exact: true }).click();

  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  for (let completed = 0; completed < 5; completed += 1) {
    await expect(page.getByText(`문장 ${completed + 1} / 5`)).toBeVisible();
    const prompt = await target.getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await page.clock.fastForward(2_000);
    await input.press("Enter");
  }

  await expect(page.getByText("5문장 완료")).toBeVisible();
  await expect(page.getByText("유효한 속도 5개 중 3개로 통계 계산")).toBeVisible();
  const statistics = page.locator(".line-session-statistics .scores");
  await expect(statistics.locator("dt").last()).toHaveText("IQR (P25–P75)");
  await expect(statistics.locator("dd").last()).toHaveText(/^\d+–\d+$/);
});

test("high scores update only after a stable session improvement and can be reset alone", async ({ page }) => {
  await page.clock.install();
  await seedPreferences(page, { linePracticeSessionLength: 5, completionSound: true });
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, "getRandomValues", {
      configurable: true,
      value: (values: Uint32Array) => { values[0] = 23; return values; },
    });
  });
  const tones = await stubCompletionTone(page);

  async function completeSession(delayMs: number) {
    await page.getByRole("button", { name: "한 줄", exact: true }).click();
    const input = page.getByRole("textbox", { name: "따라 입력하기" });
    const target = page.locator("#typing-target");
    for (let index = 0; index < 5; index += 1) {
      const prompt = await target.getAttribute("aria-label");
      expect(prompt).not.toBeNull();
      await input.fill(prompt!);
      await page.clock.fastForward(delayMs);
      await input.press("Enter");
    }
    await expect(page.getByRole("heading", { name: "연습 완료" })).toBeVisible();
  }

  await page.goto("/");
  await completeSession(10_000);
  await expect(page.getByRole("status")).toContainText("첫 최고 기록! 중간값:");
  await expect(page.getByRole("status")).toContainText("타수/분");
  const highScoreRules = page.locator(".high-score-explanation summary");
  await highScoreRules.focus();
  await highScoreRules.press("Enter");
  await expect(page.locator(".high-score-explanation")).toContainText("Mann–Whitney");
  await expect(page.locator(".high-score-explanation")).toContainText("실력 향상의 과학적 증명이 아닙니다");
  await expect.poll(tones).toBe(5);

  await page.getByRole("button", { name: "다시 연습" }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const target = page.locator("#typing-target");
  for (let index = 0; index < 5; index += 1) {
    const prompt = await target.getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await page.clock.fastForward(1_200);
    await input.press("Enter");
  }
  await expect(page.getByRole("status")).toContainText("새 최고 기록!");
  await expect(page.getByRole("status")).toContainText("변화 +");
  await expect.poll(tones).toBe(10);
  await expect.poll(() => page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    return data?.sessions?.length ?? 0;
  }, historyKey)).toBe(2);

  await page.getByRole("button", { name: "메뉴로 돌아가기" }).click();
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: "최근 연습 기록" }).click();
  await expect(page.locator(".high-score-list li")).toHaveCount(1);
  await expect(page.locator(".practice-session-list li")).toHaveCount(2);
  await page.getByRole("button", { name: "최고 기록 지우기" }).click();
  const cancel = page.getByRole("button", { name: "취소" });
  await expect(cancel).toBeFocused();
  await page.getByRole("button", { name: "최고 기록만 지우기" }).click();
  await expect(page.getByRole("status")).toContainText("최고 기록을 지웠습니다");
  await expect(page.locator(".high-score-list li")).toHaveCount(0);
  await expect(page.locator(".practice-session-list li")).toHaveCount(2);
  await expect.poll(() => page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key) ?? "null");
    return data?.highScores?.length ?? -1;
  }, historyKey)).toBe(0);
});

test("English results and history label the first eligible high score", async ({ page }) => {
  await page.clock.install();
  await seedPreferences(page, {
    interfaceLanguage: "en",
    practiceLanguage: "en",
    linePracticeSessionLength: 5,
    completionSound: false,
  });
  await page.goto("/");
  await page.getByRole("button", { name: "One-line drills" }).click();
  const input = page.getByRole("textbox", { name: "Type the prompt" });
  const target = page.locator("#typing-target");
  for (let index = 0; index < 5; index += 1) {
    const prompt = await target.getAttribute("aria-label");
    expect(prompt).not.toBeNull();
    await input.fill(prompt!);
    await page.clock.fastForward(1_200);
    await input.press("Enter");
  }
  await expect(page.getByRole("status")).toContainText("First high score! Median:");
  await expect(page.getByRole("heading", { name: "Session speed statistics" })).toBeVisible();
  const highScoreRules = page.locator(".high-score-explanation summary");
  await highScoreRules.focus();
  await highScoreRules.press("Enter");
  await expect(page.locator(".high-score-explanation")).toContainText("one-sided Mann–Whitney");
  await page.getByRole("button", { name: "Return to Menu" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Recent practice" }).click();
  await expect(page.getByRole("heading", { name: "High scores" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Practice sessions" })).toBeVisible();
});

test("IME composition and its Enter are processed separately from submission", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
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
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
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
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
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
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
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
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
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
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const input = page.getByRole("textbox", { name: "따라 입력하기" });
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  const promptCharacters = Array.from(prompt!);
  const prefixAndComposition = promptCharacters.slice(0, Math.min(3, promptCharacters.length - 1)).join("").trimEnd();

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

test("Space submits a completed Korean or English one-line prompt", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const koreanInput = page.getByRole("textbox", { name: "따라 입력하기" });
  const koreanTarget = page.locator("#typing-target");
  const koreanPrompt = await koreanTarget.getAttribute("aria-label");
  expect(koreanPrompt).not.toBeNull();
  const partial = Array.from(koreanPrompt!).slice(0, -1).join("");
  await koreanInput.fill(partial);
  await koreanInput.press("Space");
  await expect(koreanInput).toHaveValue(partial + " ");
  await koreanInput.fill(koreanPrompt!);
  await koreanInput.press("Space");
  await expect(koreanInput).toHaveValue("");
  await expect(koreanTarget).not.toHaveAttribute("aria-label", koreanPrompt!);

  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "연습 종료" }).click();
  await page.getByRole("button", { name: "환경설정" }).click();
  await page.getByRole("button", { name: /연습 언어/ }).click();
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "한 줄", exact: true }).click();
  const englishInput = page.getByRole("textbox", { name: "따라 입력하기" });
  const englishTarget = page.locator("#typing-target");
  const prompt = await page.locator("#typing-target").getAttribute("aria-label");
  expect(prompt).not.toBeNull();
  await englishInput.fill(prompt!);
  await englishInput.press("Space");
  await expect(englishInput).toHaveValue("");
  await expect(englishTarget).not.toHaveAttribute("aria-label", prompt!);
});

test("Home, End, and Page Down jump between menu entries and keep the roving focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "짧은 글", exact: true }).click();
  const entries = page.locator(".activity-menu button");
  const count = await entries.count();
  expect(count).toBeGreaterThan(6);
  await expect(entries.first()).toBeFocused();

  await page.keyboard.press("End");
  await expect(entries.nth(count - 1)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(entries.first()).toBeFocused();

  await page.keyboard.press("PageDown");
  const pageDownIndex = await entries.evaluateAll((buttons) => buttons.findIndex((button) => button === document.activeElement));
  expect(pageDownIndex).toBeGreaterThan(0);
  expect(pageDownIndex).toBeLessThan(count);
  const menuBounds = await page.locator(".activity-menu").boundingBox();
  const pageDownBounds = await entries.nth(pageDownIndex).boundingBox();
  expect(menuBounds).not.toBeNull();
  expect(pageDownBounds).not.toBeNull();
  expect(pageDownBounds!.y).toBeGreaterThanOrEqual(menuBounds!.y);
  expect(pageDownBounds!.y + pageDownBounds!.height).toBeLessThanOrEqual(menuBounds!.y + menuBounds!.height);
  await page.keyboard.press("PageUp");
  await expect(entries.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(entries.nth(count - 1)).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "짧은 글", exact: true })).toBeFocused();
});

test("keyboard navigation enters and leaves the games submenu", async ({ page }) => {
  await page.goto("/");
  const games = page.getByRole("button", { name: "게임", exact: true });
  await games.focus();
  await page.keyboard.press("Enter");
  const challenge = page.getByRole("button", { name: "30초 낱말 도전", exact: true });
  const venice = page.getByRole("button", { name: "베네치아", exact: true });
  await expect(challenge).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(venice).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(challenge).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(games).toBeFocused();
});
