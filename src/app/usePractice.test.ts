import { describe, expect, it } from "vitest";
import { activities } from "../content/library";
import type { PositionActivity, TextActivity, TextLesson } from "../content/lessons";
import { passagesFor } from "../content/passages";
import { shuffleWithSeed } from "../domain/random";
import { completionTime, linePracticeSessionLength, reducePracticeState } from "./usePractice";
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

const positions = activities.find((activity): activity is PositionActivity => activity.kind === "position");
if (!positions) throw new Error("Position practice is unavailable.");
const lines = activities.find((activity): activity is TextActivity => activity.kind === "line");
if (!lines) throw new Error("One-line practice is unavailable.");

function practice(index = 0, seed = 0x12345678): PracticeScreen {
  const started = reducePracticeState(
    { screen: "menu", selected: null },
    { type: "start", activity: words, seed },
  );
  if (started.screen !== "practice") throw new Error("expected practice");
  return index === 0 ? started : {
    ...started,
    index,
    lesson: started.activity.lessons[index]!,
    round: index,
  };
}

function submit(state: PracticeScreen, text: string): ResultScreen {
  const result = reducePracticeState(state, { type: "submit", input: text, ...completionTime(2_000) });
  if (result.screen !== "result") throw new Error("expected result");
  return result;
}

describe("word drill progression", () => {
  it("shuffles position keys and lesson order for each seeded start", () => {
    const start = (activity: PositionActivity | TextActivity, seed: number) =>
      reducePracticeState({ screen: "menu", selected: null }, { type: "start", activity, seed });
    const firstSeed = 0x12345678;
    const secondSeed = 0x87654321;
    const firstWords = start(words, firstSeed);
    const secondWords = start(words, secondSeed);
    const firstPositions = start(positions, firstSeed);
    const secondPositions = start(positions, secondSeed);
    const firstLines = start(lines, firstSeed);
    const secondLines = start(lines, secondSeed);

    expect(firstWords.screen).toBe("practice");
    expect(secondWords.screen).toBe("practice");
    expect(firstWords.screen === "practice" ? firstWords.activity.lessons : []).toEqual(shuffleWithSeed(words.lessons, firstSeed));
    expect(secondWords.screen === "practice" ? secondWords.activity.lessons : []).not.toEqual(
      firstWords.screen === "practice" ? firstWords.activity.lessons : [],
    );
    expect(firstLines.screen).toBe("practice");
    expect(secondLines.screen).toBe("practice");
    expect(firstLines.screen === "practice" ? firstLines.activity.lessons : []).toEqual(shuffleWithSeed(lines.lessons, firstSeed));
    expect(secondLines.screen === "practice" ? secondLines.activity.lessons : []).not.toEqual(
      firstLines.screen === "practice" ? firstLines.activity.lessons : [],
    );
    expect(firstPositions.screen).toBe("positions");
    expect(secondPositions.screen).toBe("positions");
    if (firstPositions.screen !== "positions" || secondPositions.screen !== "positions") return;
    expect(firstPositions.activity.keys).toEqual(shuffleWithSeed(positions.keys, firstSeed));
    expect(secondPositions.activity.keys).not.toEqual(firstPositions.activity.keys);
  });

  it("shows the result of the finished word alongside its position", () => {
    const first = practice();
    const result = submit(first, first.lesson.text);
    expect(result.wordProgress).toMatchObject({ index: 0, total: 3, title: first.lesson.title });
    expect(result.score.correctCount).toBe(first.lesson.text.length);
  });

  it("advances to every word in order and ends on the last word's result", () => {
    const first = practice();
    const orderedLessons = first.activity.lessons;
    const second = reducePracticeState(submit(first, first.lesson.text), { type: "continue" });
    if (second.screen !== "practice") throw new Error("expected practice");
    expect(second.lesson.id).toBe(orderedLessons[1]?.id);
    expect(second.session.input).toBe("");

    const third = reducePracticeState(submit(second, second.lesson.text), { type: "continue" });
    if (third.screen !== "practice") throw new Error("expected practice");
    expect(third.lesson.id).toBe(orderedLessons[2]?.id);

    const last = submit(third, third.lesson.text);
    expect(last.wordProgress).toMatchObject({ index: 2, total: 3, title: third.lesson.title });
  });

  it("wraps back to the first word after the last one", () => {
    const last = practice(2);
    const next = reducePracticeState(submit(last, last.lesson.text), { type: "continue" });
    if (next.screen !== "practice") throw new Error("expected practice");
    expect(next.lesson.id).toBe(next.activity.lessons[0]?.id);
    expect(next.session.input).toBe("");
  });

  it("restarts a word sequence with a new seeded permutation", () => {
    const last = practice(2);
    const result = submit(last, last.lesson.text);
    const retried = reducePracticeState(result, { type: "retry-randomized", seed: 0x87654321 });
    if (retried.screen !== "practice") throw new Error("expected practice");
    expect(retried.activity.lessons).toEqual(shuffleWithSeed(last.activity.lessons, 0x87654321));
    expect(retried.activity.lessons).not.toEqual(last.activity.lessons);
    expect(retried.lesson.id).toBe(retried.activity.lessons[0]?.id);
    expect(retried.session.input).toBe("");
  });

  it("returns to the word menu entry from the word result", () => {
    const first = practice();
    expect(reducePracticeState(submit(first, first.lesson.text), { type: "return-to-menu" }))
      .toEqual({ screen: "menu", selected: "ko-word" });
  });

  it("restarts a position sequence with a new seeded permutation", () => {
    const started = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "start", activity: positions, seed: 0x12345678 },
    );
    if (started.screen !== "positions") throw new Error("expected position practice");
    let result: PracticeState = started;
    for (const [index, key] of started.activity.keys.entries()) {
      result = reducePracticeState(result, { type: "position-key", key, ...completionTime(1_000 + index) });
    }
    if (result.screen !== "result") throw new Error("expected position result");
    const restarted = reducePracticeState(result, { type: "retry-randomized", seed: 0x87654321 });
    if (restarted.screen !== "positions") throw new Error("expected restarted position practice");
    expect(restarted.activity.keys).toEqual(shuffleWithSeed(started.activity.keys, 0x87654321));
    expect(restarted.activity.keys).not.toEqual(started.activity.keys);
  });

  it("restarts a one-line sequence with a new seeded permutation", () => {
    const started = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "start", activity: lines, seed: 1 },
    );
    if (started.screen !== "practice") throw new Error("expected one-line practice");
    const afterSubmit = reducePracticeState(started, {
      type: "submit",
      input: started.lesson.text,
      ...completionTime(2_000),
    });
    if (afterSubmit.screen !== "practice") throw new Error("expected next one-line prompt");
    const result = reducePracticeState(afterSubmit, { type: "finish" });
    if (result.screen !== "result") throw new Error("expected one-line result");
    const restarted = reducePracticeState(result, { type: "retry-randomized", seed: 2 });
    if (restarted.screen !== "practice") throw new Error("expected restarted one-line practice");

    expect(restarted.activity.lessons).toEqual(shuffleWithSeed(afterSubmit.activity.lessons, 2));
    expect(restarted.activity.lessons).not.toEqual(started.activity.lessons);
  });

  it("ends a one-line session after 20 completed lessons and clears progress on retry", () => {
    let state = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "start", activity: lines, seed: 0x12345678 },
    );
    if (state.screen !== "practice") throw new Error("expected one-line practice");

    for (let index = 0; index < linePracticeSessionLength; index += 1) {
      if (state.screen !== "practice") throw new Error("session ended before 20 lessons");
      const next = reducePracticeState(state, {
        type: "submit",
        input: state.lesson.text,
        ...completionTime(2_000 + index * 2_000),
      });
      if (index < linePracticeSessionLength - 1) {
        expect(next.screen).toBe("practice");
        if (next.screen !== "practice") throw new Error("expected the next one-line prompt");
      }
      state = next;
    }

    expect(state.screen).toBe("result");
    if (state.screen !== "result") return;
    expect(state.lineSessionScores).toHaveLength(linePracticeSessionLength);

    const restarted = reducePracticeState(state, { type: "retry-randomized", seed: 2 });
    if (restarted.screen !== "practice") throw new Error("expected a restarted one-line practice");
    expect(restarted.completedLineScores).toEqual([]);
    expect(restarted.round).toBe(0);
  });

  it("keeps short and long passage order unchanged", () => {
    for (const length of ["short", "long"] as const) {
      const activity = passagesFor("ko", length)[0];
      if (!activity) throw new Error(`Expected a ${length} passage.`);
      const started = reducePracticeState(
        { screen: "menu", selected: null },
        { type: "start-passage", activity },
      );
      expect(started.screen).toBe("passage");
      expect(started.screen === "passage" ? started.activity.lines : []).toEqual(activity.lines);
    }
  });
});
