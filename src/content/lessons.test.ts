import { expect, it } from "vitest";
import { activities, firstKoreanLesson } from "./library";
import { prepareLineText, textActivities } from "./lessons";
import { passageActivities, passagesFor } from "./passages";

it("skips unusable prompts without losing valid modes", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "bad", language: "en", text: " " },
    firstKoreanLesson,
  ]);
  expect(lessons.map((activity) => activity.id)).toEqual(["ko-line"]);
});

it("removes punctuation and normalizes spaces before showing line prompts", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "ko-line-test", text: "안녕, 오늘도 좋은 하루 보내세요!" },
    { ...firstKoreanLesson, id: "en-line-test", language: "en", text: "Hello, have a beautiful day ahead!" },
  ]).flatMap((activity) => activity.lessons);
  const promptFor = (id: string) => lessons.find((lesson) => lesson.id === id)?.text;

  expect(promptFor("ko-line-test")).toBe("안녕 오늘도 좋은 하루 보내세요");
  expect(promptFor("en-line-test")).toBe("Hello have a beautiful day ahead");
  const koreanLine = activities.find((activity) => activity.id === "ko-line");
  expect(koreanLine?.kind === "line" ? koreanLine.lessons[0]?.text : undefined)
    .toBe(firstKoreanLesson.text);
});

it("rejects mixed-script and shorter-than-four-word line prompts", () => {
  expect(prepareLineText("오늘은 apple을 샀습니다", "ko")).toBeNull();
  expect(prepareLineText("We practice 한글 every day", "en")).toBeNull();
  expect(textActivities([
    { ...firstKoreanLesson, id: "short-line", text: "오늘은 좋은 하루" },
  ])).toEqual([]);
});

it("bundles line, short passage, and long passage assets for both languages", () => {
  expect(activities.map((activity) => activity.id)).toEqual(
    ["ko-line", "en-line"],
  );
  const koreanLine = activities.find((activity) => activity.id === "ko-line");
  expect(koreanLine?.kind === "line" ? koreanLine.lessons.length : 0).toBeGreaterThanOrEqual(100);
  const englishLine = activities.find((activity) => activity.id === "en-line");
  expect(englishLine?.kind === "line" ? englishLine.lessons.length : 0).toBeGreaterThanOrEqual(100);
  for (const activity of [koreanLine, englishLine]) {
    const prompts = activity?.kind === "line" ? activity.lessons.map((lesson) => lesson.text) : [];
    expect(new Set(prompts).size).toBe(prompts.length);
  }
  for (const lesson of [
    ...(koreanLine?.kind === "line" ? koreanLine.lessons : []),
    ...(englishLine?.kind === "line" ? englishLine.lessons : []),
  ]) {
    expect(lesson.text.split(" ").length).toBeGreaterThanOrEqual(4);
    expect(lesson.text).not.toMatch(/[\p{P}\p{N}\p{S}]/u);
    expect(lesson.text).not.toMatch(/[\r\n]/);
    if (lesson.language === "ko") expect(lesson.text).toMatch(/^[\p{Script=Hangul} ]+$/u);
    else expect(lesson.text).toMatch(/^[\p{Script=Latin} ]+$/u);
  }
  expect(passagesFor("ko", "short").length).toBeGreaterThanOrEqual(30);
  expect(passagesFor("ko", "long").length).toBeGreaterThanOrEqual(5);
  expect(passagesFor("en", "short").length).toBeGreaterThanOrEqual(10);
  expect(passagesFor("en", "long").length).toBeGreaterThanOrEqual(5);
  for (const passage of passageActivities) {
    expect(passage.characterCount).toBeGreaterThanOrEqual(passage.length === "short" ? 200 : 2_000);
    if (passage.length === "short") expect(passage.characterCount).toBeLessThanOrEqual(2_000);
    expect(passage.lines.length).toBeGreaterThan(0);
  }
});

it("loads attributed animation, game, film, and traditional lines", () => {
  const koreanLines = activities.find((activity) => activity.id === "ko-line");
  const englishLines = activities.find((activity) => activity.id === "en-line");
  const koreanLessons = koreanLines?.kind === "line" ? koreanLines.lessons : [];
  const englishLessons = englishLines?.kind === "line" ? englishLines.lessons : [];

  expect(koreanLessons.filter((lesson) => lesson.source === "quote").length).toBeGreaterThanOrEqual(10);
  expect(koreanLessons.filter((lesson) => lesson.source === "traditional").length).toBeGreaterThanOrEqual(50);
  expect(englishLessons.filter((lesson) => lesson.source === "quote").length).toBeGreaterThanOrEqual(12);
  expect(englishLessons.filter((lesson) => lesson.source === "traditional").length).toBeGreaterThanOrEqual(50);

  for (const lesson of [...koreanLessons, ...englishLessons]) {
    if (lesson.source === "original") {
      expect(lesson.credit).toBeNull();
      continue;
    }
    expect(lesson.credit?.author.trim()).not.toBe("");
    expect(lesson.credit?.source.trim()).not.toBe("");
    expect(lesson.credit?.url).toMatch(/^https:\/\//);
    expect(lesson.text).not.toMatch(/[\r\n]/);
  }
});

it("credits every copied passage and keeps extraction artifacts out of the text", () => {
  const copied = passageActivities.filter((passage) => passage.license !== "original");
  expect(copied.length).toBeGreaterThanOrEqual(38);
  for (const passage of passageActivities) {
    if (passage.license === "original") {
      expect(passage.credit).toBeNull();
      continue;
    }
    expect(passage.credit).not.toBeNull();
    expect(passage.credit?.author.trim()).not.toBe("");
    expect(passage.credit?.source.trim()).not.toBe("");
    expect(passage.credit?.url).toMatch(/^https:\/\//);
    expect(passage.text).not.toMatch(/섬네일|\{\{|&#\d+;|&[a-z]+;|\[https?:\/\/|\[\d+\]|Listen to this text/i);
  }
});

it("keeps every copied passage closed on a complete sentence", () => {
  for (const passage of passageActivities.filter((entry) => entry.license !== "original")) {
    expect(passage.text).not.toMatch(/[:;,]$/);
    expect(passage.text).toMatch(/[.!?。？！…"'”’)\]]$/);
  }
});
