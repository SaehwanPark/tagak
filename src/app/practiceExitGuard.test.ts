import { describe, expect, it } from "vitest";
import { activities } from "../content/library";
import type { TextActivity } from "../content/lessons";
import { passagesFor } from "../content/passages";
import { completionTime, linePracticeSessionLength, reducePracticeState } from "./usePractice";
import type { PracticeContentState } from "./usePractice";
import { shouldConfirmPracticeExit } from "./practiceExitGuard";

const lines = activities.find((activity): activity is TextActivity => activity.id === "ko-line")!;
type LinePracticeState = Extract<PracticeContentState, { screen: "practice" }>;

function startLinePractice(): LinePracticeState {
  const state = reducePracticeState(
    { screen: "menu", selected: null },
    { type: "start", activity: lines, seed: 17, lineSessionLength: linePracticeSessionLength },
  );
  if (state.screen !== "practice") throw new Error("expected one-line practice");
  return state;
}

describe("practice exit guard", () => {
  it("does not interrupt an empty or barely started practice line", () => {
    const practice = startLinePractice();
    expect(shouldConfirmPracticeExit(practice)).toBe(false);

    const typed = reducePracticeState(practice, { type: "input-changed", input: "가나다라마바사아자", at: 1 });
    if (typed.screen !== "practice") throw new Error("expected one-line practice");
    expect(shouldConfirmPracticeExit(typed)).toBe(false);
  });

  it("protects a meaningful partial line and an already submitted line", () => {
    const practice = startLinePractice();
    const partial = reducePracticeState(practice, { type: "input-changed", input: "가나다라마바사아자차", at: 1 });
    if (partial.screen !== "practice") throw new Error("expected one-line practice");
    expect(shouldConfirmPracticeExit(partial)).toBe(true);

    const submitted = reducePracticeState(practice, {
      type: "submit",
      input: practice.lesson.text,
      ...completionTime(2_000),
    });
    if (submitted.screen !== "practice") throw new Error("expected the next one-line prompt");
    expect(shouldConfirmPracticeExit(submitted)).toBe(true);
  });

  it("protects meaningful progress in both short and long passages", () => {
    for (const length of ["short", "long"] as const) {
      const activity = passagesFor("ko", length)[0];
      if (!activity) throw new Error(`expected a ${length} passage`);
      const passage = reducePracticeState(
        { screen: "menu", selected: null },
        { type: "start-passage", activity },
      );
      if (passage.screen !== "passage") throw new Error(`expected ${length} passage practice`);
      expect(shouldConfirmPracticeExit(passage)).toBe(false);

      const partial = reducePracticeState(passage, { type: "input-changed", input: "가나다라마바사아자차", at: 1 });
      if (partial.screen !== "passage") throw new Error(`expected ${length} passage practice`);
      expect(shouldConfirmPracticeExit(partial)).toBe(true);

      const completedLine = reducePracticeState(passage, {
        type: "submit",
        input: activity.lines[0],
        ...completionTime(2_000),
      });
      if (completedLine.screen !== "passage") throw new Error(`expected more lines in ${length} passage`);
      expect(shouldConfirmPracticeExit(completedLine)).toBe(true);
    }
  });
});
