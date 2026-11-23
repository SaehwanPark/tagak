import { expect, it } from "vitest";
import { activities, firstKoreanLesson } from "./library";
import { textActivities } from "./lessons";
import { passageActivities, passagesFor } from "./passages";

it("skips unusable prompts without losing valid modes", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "bad", mode: "word", language: "en", text: " " },
    firstKoreanLesson,
  ]);
  expect(lessons.map((activity) => activity.id)).toEqual(["ko-line"]);
});

it("trims only line-ending punctuation from Korean line prompts", () => {
  const lessons = textActivities([
    { ...firstKoreanLesson, id: "ko-line-test", text: "안녕, 반가워요!" },
    { ...firstKoreanLesson, id: "ko-word-test", mode: "word", text: "단어!" },
    { ...firstKoreanLesson, id: "en-line-test", language: "en", text: "Hello!" },
  ]).flatMap((activity) => activity.lessons);
  const promptFor = (id: string) => lessons.find((lesson) => lesson.id === id)?.text;

  expect(promptFor("ko-line-test")).toBe("안녕, 반가워요");
  expect(promptFor("ko-word-test")).toBe("단어!");
  expect(promptFor("en-line-test")).toBe("Hello!");
  const koreanLine = activities.find((activity) => activity.id === "ko-line");
  expect(koreanLine?.kind === "line" ? koreanLine.lessons[0]?.text : undefined)
    .toBe(firstKoreanLesson.text);
});

it("bundles line, short passage, and long passage assets for both languages", () => {
  expect(activities.map((activity) => activity.id)).toEqual(
    ["ko-positions", "ko-word", "ko-line", "en-word", "en-line"],
  );
  const koreanLine = activities.find((activity) => activity.id === "ko-line");
  expect(koreanLine?.kind === "line" ? koreanLine.lessons.length : 0).toBeGreaterThan(5);
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

  expect(koreanLessons.filter((lesson) => lesson.source === "quote")).toHaveLength(20);
  expect(koreanLessons.filter((lesson) => lesson.source === "traditional").length).toBeGreaterThanOrEqual(35);
  expect(englishLessons.filter((lesson) => lesson.source === "quote")).toHaveLength(13);
  expect(englishLessons.filter((lesson) => lesson.source === "traditional").length).toBeGreaterThanOrEqual(35);

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
