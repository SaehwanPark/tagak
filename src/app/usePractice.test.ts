import { describe, expect, it } from "vitest";
import { activities } from "../content/library";
import type { TextActivity } from "../content/lessons";
import { passagesFor } from "../content/passages";
import { shuffleWithSeed } from "../domain/random";
import { completionTime, gamesEntry, linePracticeSessionLength, reducePracticeState, settingsEntry } from "./usePractice";
import type { PracticeState } from "./usePractice";

type PracticeScreen = Extract<PracticeState, { screen: "practice" }>;

const lines = activities.find((activity): activity is TextActivity => activity.id === "ko-line")!;

function startLines(seed = 0x12345678): PracticeScreen {
  const started = reducePracticeState(
    { screen: "menu", selected: null },
    { type: "start", activity: lines, seed },
  );
  if (started.screen !== "practice") throw new Error("expected one-line practice");
  return started;
}

function submit(state: PracticeScreen, text: string): PracticeState {
  return reducePracticeState(state, { type: "submit", input: text, ...completionTime(2_000) });
}

describe("one-line practice progression", () => {
  it("uses a seeded permutation for each new run", () => {
    const firstSeed = 0x12345678;
    const secondSeed = 0x87654321;
    const first = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "start", activity: lines, seed: firstSeed },
    );
    const second = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "start", activity: lines, seed: secondSeed },
    );

    expect(first.screen).toBe("practice");
    expect(second.screen).toBe("practice");
    expect(first.screen === "practice" ? first.activity.lessons : []).toEqual(shuffleWithSeed(lines.lessons, firstSeed));
    expect(second.screen === "practice" ? second.activity.lessons : []).not.toEqual(
      first.screen === "practice" ? first.activity.lessons : [],
    );
  });

  it("records a submitted line and continues to the next prompt", () => {
    const first = startLines();
    const next = submit(first, first.lesson.text);
    if (next.screen !== "practice") throw new Error("expected the next one-line prompt");

    expect(next.lesson.id).not.toBe(first.lesson.id);
    expect(next.session.input).toBe("");
    expect(next.previous?.correctCount).toBe(first.lesson.text.length);
    expect(next.completedLineScores).toHaveLength(1);
  });

  it("finishes early with completed line scores", () => {
    const first = startLines();
    const next = submit(first, first.lesson.text);
    if (next.screen !== "practice") throw new Error("expected the next one-line prompt");
    const result = reducePracticeState(next, { type: "finish" });
    if (result.screen !== "result") throw new Error("expected an early result");

    expect(result.score).toEqual(next.previous);
    expect(result.lineSessionScores).toHaveLength(1);
  });

  it("ends after 20 submitted lines and clears progress on retry", () => {
    let state: PracticeState = startLines();

    for (let index = 0; index < linePracticeSessionLength; index += 1) {
      if (state.screen !== "practice") throw new Error("session ended before 20 lessons");
      const next = submit(state, state.lesson.text);
      if (index < linePracticeSessionLength - 1) {
        expect(next.screen).toBe("practice");
        if (next.screen !== "practice") throw new Error("expected the next one-line prompt");
      }
      state = next;
    }

    expect(state.screen).toBe("result");
    if (state.screen !== "result") return;
    expect(state.lineSessionScores).toHaveLength(linePracticeSessionLength);
    if (state.activity.kind === "passage") throw new Error("expected one-line result");

    const restarted = reducePracticeState(state, { type: "retry-randomized", seed: 2 });
    if (restarted.screen !== "practice") throw new Error("expected a restarted one-line practice");
    expect(restarted.completedLineScores).toEqual([]);
    expect(restarted.round).toBe(0);
    expect(restarted.activity.lessons).toEqual(shuffleWithSeed(state.activity.lessons, 2));
  });

  it("returns from each passage without changing its order", () => {
    for (const length of ["short", "long"] as const) {
      const activity = passagesFor("ko", length)[0];
      if (!activity) throw new Error("expected a passage");
      const started = reducePracticeState(
        { screen: "menu", selected: null },
        { type: "start-passage", activity },
      );
      expect(started.screen).toBe("passage");
      expect(started.screen === "passage" ? started.activity.lines : []).toEqual(activity.lines);
    }
  });
});

describe("home navigation", () => {
  it("keeps games in a submenu and returns to its selected home entry", () => {
    const games = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "open-games" },
    );
    expect(games).toEqual({ screen: "games", selected: null });

    const challenge = reducePracticeState(games, { type: "open-challenge" });
    expect(challenge).toEqual({ screen: "challenge" });
    expect(reducePracticeState(challenge, { type: "return-to-menu" }))
      .toEqual({ screen: "games", selected: "challenge" });
    expect(reducePracticeState({ screen: "games", selected: "challenge" }, { type: "return-to-menu" }))
      .toEqual({ screen: "menu", selected: gamesEntry.id });
  });

  it("opens history and data transfer from settings and restores the selected row", () => {
    const settings = reducePracticeState(
      { screen: "menu", selected: null },
      { type: "open-settings" },
    );
    expect(settings).toMatchObject({
      screen: "settings",
      returnState: { screen: "menu", selected: settingsEntry.id },
      view: "menu",
    });

    const history = reducePracticeState(settings, { type: "open-settings-history" });
    expect(history).toMatchObject({ screen: "settings", view: "history", focusRow: "open-history" });
    const settingsAfterHistory = reducePracticeState(history, { type: "return-to-settings" });
    expect(settingsAfterHistory).toMatchObject({ screen: "settings", view: "menu", focusRow: "open-history" });

    const backup = reducePracticeState(settingsAfterHistory, { type: "open-settings-data-transfer" });
    expect(backup).toMatchObject({ screen: "settings", view: "data-transfer", focusRow: "open-data-transfer" });
    const settingsAfterBackup = reducePracticeState(backup, { type: "return-to-settings" });
    expect(settingsAfterBackup).toMatchObject({ screen: "settings", view: "menu", focusRow: "open-data-transfer" });
    expect(reducePracticeState(settingsAfterBackup, { type: "close-settings" }))
      .toEqual({ screen: "menu", selected: settingsEntry.id });
  });

  it("returns to the active game after opening settings from play", () => {
    const game = { screen: "challenge" } as const;
    const settings = reducePracticeState(game, { type: "open-settings" });
    expect(settings).toMatchObject({ screen: "settings", returnState: game });
    expect(reducePracticeState(settings, { type: "close-settings" })).toEqual(game);
  });
});
