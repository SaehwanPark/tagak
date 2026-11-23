import { describe, expect, it } from "vitest";
import type { TextActivity, TextLesson } from "../content/lessons";
import { completionTime, reducePracticeState } from "./usePractice";
import type { PracticeState } from "./usePractice";

type PracticeScreen = Extract<PracticeState, { screen: "practice" }>;
type ResultScreen = Extract<PracticeState, { screen: "result" }>;

function lesson(id: string, text: string): TextLesson {
  return { id, title: text, mode: "word", language: "ko", source: "original", credit: null, text };
}

const words: TextActivity = {
  id: "ko-word",
  kind: "word",
  label: "낱말",
  lessons: [lesson("one", "연필"), lesson("two", "창문"), lesson("three", "강물")],
};

function practice(index = 0): PracticeScreen {
  const started = reducePracticeState({ screen: "menu", selected: null }, { type: "start", activity: words });
  if (started.screen !== "practice") throw new Error("expected practice");
  return index === 0 ? started : { ...started, index, lesson: words.lessons[index]!, round: index };
}

function submit(state: PracticeScreen, text: string): ResultScreen {
  const result = reducePracticeState(state, { type: "submit", input: text, ...completionTime(2_000) });
  if (result.screen !== "result") throw new Error("expected result");
  return result;
}

describe("word drill progression", () => {
  it("shows the result of the finished word alongside its position", () => {
    const result = submit(practice(), "연필");
    expect(result.wordProgress).toMatchObject({ index: 0, total: 3, title: "연필" });
    expect(result.score.correctCount).toBe(2);
  });

  it("advances to every word in order and ends on the last word's result", () => {
    const second = reducePracticeState(submit(practice(), "연필"), { type: "continue" });
    if (second.screen !== "practice") throw new Error("expected practice");
    expect(second.lesson.id).toBe("two");
    expect(second.session.input).toBe("");

    const third = reducePracticeState(submit(second, "창문"), { type: "continue" });
    if (third.screen !== "practice") throw new Error("expected practice");
    expect(third.lesson.id).toBe("three");

    const last = submit(third, "강물");
    expect(last.wordProgress).toMatchObject({ index: 2, total: 3, title: "강물" });
  });

  it("wraps back to the first word after the last one", () => {
    const next = reducePracticeState(submit(practice(2), "강물"), { type: "continue" });
    if (next.screen !== "practice") throw new Error("expected practice");
    expect(next.lesson.id).toBe("one");
    expect(next.session.input).toBe("");
  });

  it("retries the word that was just finished instead of the first one", () => {
    const retried = reducePracticeState(submit(practice(2), "강물"), { type: "retry" });
    if (retried.screen !== "practice") throw new Error("expected practice");
    expect(retried.lesson.id).toBe("three");
    expect(retried.session.input).toBe("");
  });

  it("returns to the word menu entry from the word result", () => {
    expect(reducePracticeState(submit(practice(), "연필"), { type: "return-to-menu" }))
      .toEqual({ screen: "menu", selected: "ko-word" });
  });
});
