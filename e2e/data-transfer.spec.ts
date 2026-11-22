import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

function makeRecord(id: string, completedAt: number) {
  return {
    id,
    materialId: id,
    completedAt,
    mode: "line",
    language: "ko",
    score: {
      accuracy: 100,
      correctCount: 1,
      typedCount: 1,
      elapsedMs: 1_000,
      charactersPerMinute: 60,
      keystrokeCount: 1,
      keystrokesPerMinute: 60,
    },
  };
}

function makeBackup(records: ReturnType<typeof makeRecord>[]) {
  return {
    format: "tagak-data-backup",
    version: 1,
    exportedAt: "2026-11-22T12:00:00.000Z",
    data: {
      preferences: {
        version: 2,
        preferences: {
          interfaceLanguage: "ko",
          practiceLanguage: "ko",
          completionSound: false,
          typingSpeedUnits: { ko: "cpm", en: "wpm" },
        },
      },
      textSize: { version: 1, size: "standard" },
      colorTheme: { version: 1, theme: "terminal" },
      practiceFonts: { version: 2, fonts: { ko: "gothic", en: "gothic" } },
      history: { version: 3, records },
      venice: { version: 1, rulesVersion: 1, recentRuns: [], topScores: [] },
    },
  };
}

test("backup export contains saved records but excludes active typing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "[기타] 연습장" }).click();
  await page.getByRole("textbox", { name: "원하는 내용을 자유롭게 입력하세요" }).fill("이 문장은 백업에 포함되면 안 됩니다.");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "[기타] 데이터 백업·가져오기" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "백업 내보내기" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^tagak-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  const backup = JSON.parse(await readFile(path!, "utf8")) as { format: string; data: unknown };
  expect(backup.format).toBe("tagak-data-backup");
  expect(JSON.stringify(backup)).not.toContain("이 문장은 백업에 포함되면 안 됩니다.");
  await expect(page.getByRole("status")).toHaveText("백업 파일을 저장했습니다.");
});

test("valid imports offer a merge and make merged history visible", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((record) => {
    localStorage.setItem("tagak:history", JSON.stringify({ version: 3, records: [record] }));
  }, makeRecord("current", 10));
  await page.getByRole("button", { name: "[기타] 데이터 백업·가져오기" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "tagak-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(makeBackup([makeRecord("imported", 20)]))),
  });

  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "병합" }).click();
  await expect(page.getByRole("status")).toHaveText("백업 데이터를 병합했습니다.");
  await page.getByRole("button", { name: "← 메뉴" }).click();
  await page.getByRole("button", { name: "[기타] 최근 연습 기록" }).click();
  await expect(page.locator(".history-list li")).toHaveCount(2);
});

test("corrupt imports leave the current data untouched", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("tagak:history", "keep-this-value"));
  await page.getByRole("button", { name: "[기타] 데이터 백업·가져오기" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });

  await expect(page.locator(".data-transfer-notice"))
    .toHaveText("이 백업 파일은 손상되었거나 지원하지 않는 형식입니다. 기존 데이터는 바꾸지 않았습니다.");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("tagak:history"))).toBe("keep-this-value");
});
