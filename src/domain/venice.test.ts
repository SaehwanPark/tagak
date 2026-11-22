import { describe, expect, it } from "vitest";
import {
  calculateVeniceWord,
  createVeniceReady,
  fallDurationMs,
  isVeniceWordHidden,
  rankVeniceTopScores,
  recommendVeniceStartLevel,
  reduceVeniceState,
  scoreVeniceWord,
  spawnIntervalMs,
  startVeniceGame,
  targetCpm,
  veniceLevelCount,
  veniceStageConfig,
  veniceStageQuota,
} from "./venice";
import type { FallingWord, VeniceLevelStats, VeniceRun, VeniceState } from "./venice";

const pool = [calculateVeniceWord("바람"), calculateVeniceWord("고양이"), calculateVeniceWord("하늘")];

function playing(
  overrides: Partial<NonNullable<Extract<VeniceState, { phase: "playing" }>["runtime"]>> = {},
): Extract<VeniceState, { phase: "playing" }> {
  const state = startVeniceGame(1, 0, 1_000, 1, "run-1");
  if (state.phase !== "playing") throw new Error("Expected a running game.");
  return { phase: "playing", runtime: { ...state.runtime, nextId: 2, ...overrides } };
}

function word(overrides: Partial<FallingWord> = {}): FallingWord {
  return {
    id: 1,
    order: 1,
    text: "바람",
    keystrokes: 5,
    lane: 2,
    y: 20,
    kind: "regular",
    effect: null,
    ...overrides,
  };
}

function levelStats(overrides: Partial<VeniceLevelStats> = {}): VeniceLevelStats {
  return { level: 1, spawned: 0, typedCorrectly: 0, missed: 0, durationMs: 0, ...overrides };
}

function run(
  id: string,
  highestLevel: number,
  stats: readonly VeniceLevelStats[],
  options: Partial<VeniceRun> = {},
): VeniceRun {
  return {
    id,
    rulesVersion: 1,
    startedAt: 1_000,
    completedAt: 2_000,
    startLevel: stats[0]?.level ?? 1,
    highestLevel,
    score: 100,
    typedWords: 1,
    missedWords: 0,
    durationMs: 1_000,
    levelStats: stats,
    ...options,
  };
}

describe("Venice level curve and scoring", () => {
  it("uses the specified 14-level exponential CPM targets", () => {
    expect(Array.from({ length: veniceLevelCount }, (_, index) => targetCpm(index + 1))).toEqual([
      100, 119, 143, 170, 203, 242, 289, 346, 412, 492, 588, 702, 838, 1_000,
    ]);
  });

  it("increases same-word scoring with level and raises pressure independently", () => {
    expect(scoreVeniceWord("한글", 1)).toBe(60);
    expect(scoreVeniceWord("한글", 7)).toBe(174);
    expect(scoreVeniceWord("한글", 14)).toBe(600);
    expect(spawnIntervalMs(14)).toBeLessThan(spawnIntervalMs(1));
    expect(fallDurationMs(14)).toBeLessThan(fallDurationMs(1));
    expect(Array.from({ length: veniceLevelCount }, (_, index) => veniceStageConfig(index + 1).maxActive))
      .toEqual([4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]);
    expect(veniceStageConfig(1).specialChance).toBeLessThan(veniceStageConfig(14).specialChance);
    expect(veniceStageConfig(1).maxSyllables).toBeLessThan(veniceStageConfig(14).maxSyllables);
  });

  it("clamps manual start levels and uses the recommendation as the default", () => {
    const ready = createVeniceReady();
    expect(ready).toEqual({ phase: "ready", startLevel: 1, recommendedLevel: 1 });
    const selected = reduceVeniceState(ready, { type: "select-level", level: 99 }, pool);
    expect(selected).toMatchObject({ phase: "ready", startLevel: 14 });
  });

  it("schedules the first word from elapsed time even when the page has been open", () => {
    let state = startVeniceGame(1, 50_000, 100_000, 1, "run-later");
    for (let at = 50_050; at <= 53_000; at += 50) {
      state = reduceVeniceState(state, { type: "tick", at, completedAt: 100_000 + at - 50_000 }, pool);
    }
    expect(state.phase).toBe("playing");
    if (state.phase !== "playing") return;
    expect(state.runtime.elapsedMs).toBe(3_000);
    expect(state.runtime.words).toHaveLength(1);
  });

  it("does not repeat a word while unused eligible words remain", () => {
    const state = playing({ nextSpawnAt: 1 });
    const first = reduceVeniceState(state, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(first.phase).toBe("playing");
    if (first.phase !== "playing") return;

    const firstText = first.runtime.words[0]?.text;
    expect(firstText).toBeTruthy();
    expect(first.runtime.usedWordTexts).toEqual([firstText]);

    const secondRuntime = { ...first.runtime, nextSpawnAt: first.runtime.elapsedMs + 50 };
    const second = reduceVeniceState(
      { phase: "playing", runtime: secondRuntime },
      { type: "tick", at: first.runtime.lastAt + 50, completedAt: 1_100 },
      pool,
    );
    expect(second.phase).toBe("playing");
    if (second.phase !== "playing") return;
    expect(new Set(second.runtime.words.map((word) => word.text)).size).toBe(2);
    expect(second.runtime.usedWordTexts).toHaveLength(2);
  });
});

describe("Venice word and stage rules", () => {
  it("removes the lowest duplicate first and awards only that word's score", () => {
    const state = playing({
      words: [
        word({ id: 1, order: 1, y: 25 }),
        word({ id: 2, order: 2, y: 60 }),
      ],
    });
    const input = reduceVeniceState(state, { type: "input", input: "바람" }, pool);
    const submitted = reduceVeniceState(input, { type: "submit" }, pool);
    expect(submitted).toMatchObject({
      phase: "playing",
      runtime: { score: 50, typedWords: 1, words: [{ id: 1 }] },
    });
  });

  it("keeps the game unchanged for a mismatched submission", () => {
    const state = playing({ words: [word()], input: "바다" });
    const result = reduceVeniceState(state, { type: "submit" }, pool);
    expect(result).toMatchObject({ phase: "playing", runtime: { score: 0, typedWords: 0, message: "mismatch" } });
    if (result.phase === "playing") expect(result.runtime.words).toHaveLength(1);
  });

  it("damages one tower block when a regular word reaches the collision line", () => {
    const state = playing({
      towerBlocks: 12,
      words: [word({ y: 74.99 })],
      levelStats: [levelStats({ spawned: 1 })],
    });
    const result = reduceVeniceState(state, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(result).toMatchObject({
      phase: "playing",
      runtime: {
        towerBlocks: 11,
        missedWords: 1,
        levelStats: [{ spawned: 1, missed: 1 }],
        words: [],
      },
    });
  });

  it("finishes when the twelfth tower block is lost and keeps a run summary", () => {
    const state = playing({
      towerBlocks: 1,
      words: [word({ y: 74.99 })],
      levelStats: [levelStats({ spawned: 1 })],
    });
    const result = reduceVeniceState(state, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(result).toMatchObject({
      phase: "finished",
      run: { id: "run-1", score: 0, missedWords: 1, durationMs: 50, highestLevel: 1 },
    });
  });

  it("advances after the stage quota is spawned and all current words are resolved", () => {
    const state = playing({
      level: 13,
      highestLevel: 13,
      nextSpawnAt: 10_000,
      levelStats: [levelStats({ level: 13, spawned: veniceStageQuota, durationMs: 500 })],
      infectionActive: true,
      effects: { haste: 2_000 },
      mines: [{ id: 3, lane: 1, y: 58, expiresAt: 4_000 }],
    });
    const result = reduceVeniceState(state, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(result).toMatchObject({
      phase: "playing",
      runtime: {
        level: 14,
        highestLevel: 14,
        infectionActive: false,
        effects: {},
        mines: [],
        levelStats: [{ level: 13, spawned: 20 }, { level: 14, spawned: 0 }],
      },
    });
  });

  it("continues spawning and scoring beyond the level 14 quota", () => {
    const state = playing({
      level: 14,
      highestLevel: 14,
      nextSpawnAt: 0,
      randomState: 0x12345678,
      levelStats: [levelStats({ level: 14, spawned: veniceStageQuota })],
    });
    const result = reduceVeniceState(state, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(result).toMatchObject({ phase: "playing", runtime: { level: 14, levelStats: [{ spawned: 21 }] } });
  });

  it("drops paused time and resumes with a new simulation timestamp", () => {
    const state = reduceVeniceState(playing(), { type: "tick", at: 50, completedAt: 1_050 }, pool);
    const paused = reduceVeniceState(state, { type: "pause" }, pool);
    const resumed = reduceVeniceState(paused, { type: "resume", at: 10_000 }, pool);
    const result = reduceVeniceState(resumed, { type: "tick", at: 10_050, completedAt: 11_050 }, pool);
    expect(result).toMatchObject({ phase: "playing", runtime: { elapsedMs: 100 } });
  });
});

describe("Venice special words", () => {
  it("refreshes a timed effect from the current elapsed time and expires it at its boundary", () => {
    const state = playing({
      elapsedMs: 2_000,
      lastAt: 2_000,
      nextSpawnAt: 10_000,
      effects: { haste: 6_000 },
      words: [word({ kind: "virus", effect: "haste" })],
      input: "바람",
    });
    const refreshed = reduceVeniceState(state, { type: "submit" }, pool);
    expect(refreshed).toMatchObject({ phase: "playing", runtime: { effects: { haste: 7_000 } } });

    let expired = refreshed;
    for (let at = 2_050; at <= 7_000; at += 50) {
      expired = reduceVeniceState(expired, { type: "tick", at, completedAt: 1_000 + at }, pool);
    }
    expect(expired).toMatchObject({ phase: "playing", runtime: { elapsedMs: 7_000, effects: {} } });
  });

  it("uses deterministic precedence when timed effects overlap", () => {
    const active = playing({
      elapsedMs: 0,
      lastAt: 0,
      nextSpawnAt: 3_000,
      effects: { slow: 1_000, haste: 1_000 },
      words: [word({ y: 20 })],
    });
    const sped = reduceVeniceState(active, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(sped.phase).toBe("playing");
    if (sped.phase !== "playing") return;
    expect(sped.runtime.words[0]?.y).toBeCloseTo(20 + 100 * 50 / fallDurationMs(1) * 1.4, 6);

    const frozen = playing({
      elapsedMs: 0,
      lastAt: 0,
      nextSpawnAt: 3_000,
      effects: { freeze: 1_000, slow: 1_000, haste: 1_000 },
      words: [word({ y: 20 })],
    });
    const paused = reduceVeniceState(frozen, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(paused).toMatchObject({ phase: "playing", runtime: { words: [{ y: 20 }] } });
  });

  it("hides only alternating words during alternating phases of the hide effect", () => {
    const hiddenPhase = playing({ elapsedMs: 10_000, effects: { hide: 15_000 } });
    expect(hiddenPhase.phase).toBe("playing");
    if (hiddenPhase.phase !== "playing") return;
    expect(isVeniceWordHidden(2, hiddenPhase.runtime)).toBe(true);
    expect(isVeniceWordHidden(3, hiddenPhase.runtime)).toBe(false);
    expect(isVeniceWordHidden(2, { ...hiddenPhase.runtime, elapsedMs: 11_500 })).toBe(false);
    expect(isVeniceWordHidden(2, { ...hiddenPhase.runtime, elapsedMs: 15_000 })).toBe(false);
  });

  it.each([
    ["clear", { words: [] }],
    ["freeze", { effects: { freeze: 3_000 } }],
    ["repair", { towerBlocks: 11 }],
    ["haste", { effects: { haste: 5_000 } }],
    ["slow", { effects: { slow: 5_000 } }],
    ["hide", { effects: { hide: 5_000 } }],
    ["swarm", { levelStats: [levelStats({ spawned: 3 })] }],
    ["mine", { mines: [{ id: 2, lane: expect.any(Number), y: 58, expiresAt: 8_000 }] }],
    ["infection", { infectionActive: false }],
  ] as const)("applies the %s effect on a direct hit", (effect, expected) => {
    const state = playing({
      towerBlocks: effect === "repair" ? 7 : 12,
      infectionActive: effect === "infection",
      words: [
        word({ id: 1, order: 1, kind: "virus", effect, text: "바람" }),
        ...(effect === "clear" ? [word({ id: 2, order: 2, text: "하늘" })] : []),
      ],
      input: "바람",
    });
    const result = reduceVeniceState(state, { type: "submit" }, pool);
    expect(result.phase).toBe("playing");
    if (result.phase !== "playing") return;
    expect(result.runtime).toMatchObject(expected);
    expect(result.runtime.typedWords).toBe(1);
    expect(result.runtime.score).toBe(50);
  });

  it("an auto-clear removes other words without scoring them", () => {
    const state = playing({
      words: [
        word({ id: 1, kind: "virus", effect: "clear", text: "바람" }),
        word({ id: 2, text: "하늘" }),
      ],
      input: "바람",
    });
    const result = reduceVeniceState(state, { type: "submit" }, pool);
    expect(result).toMatchObject({ phase: "playing", runtime: { words: [], typedWords: 1, score: 50 } });
  });

  it("counts swarm spawns toward the stage quota without exceeding it", () => {
    const state = playing({
      nextSpawnAt: 3_000,
      levelStats: [levelStats({ spawned: veniceStageQuota - 1 })],
      words: [word({ kind: "virus", effect: "swarm" })],
      input: "바람",
    });
    const result = reduceVeniceState(state, { type: "submit" }, pool);
    expect(result).toMatchObject({
      phase: "playing",
      runtime: {
        levelStats: [{ spawned: veniceStageQuota }],
        words: [{ kind: "regular" }],
      },
    });
  });

  it("a missed infection virus damages the tower and makes later misses dangerous", () => {
    const safeMiss = reduceVeniceState(playing({
      words: [word({ id: 3, kind: "virus", effect: "slow", y: 74.99 })],
    }), { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(safeMiss).toMatchObject({ phase: "playing", runtime: { infectionActive: false, towerBlocks: 12 } });

    const state = playing({
      words: [word({ id: 1, kind: "virus", effect: "infection", y: 74.99 })],
    });
    const infected = reduceVeniceState(state, { type: "tick", at: 50, completedAt: 1_050 }, pool);
    expect(infected).toMatchObject({ phase: "playing", runtime: { infectionActive: true, towerBlocks: 11 } });
    if (infected.phase !== "playing") throw new Error("Expected the infected session to continue.");
    const followup = reduceVeniceState({
      phase: "playing",
      runtime: { ...infected.runtime, words: [word({ id: 2, kind: "virus", effect: "slow", y: 74.99 })] },
    }, { type: "tick", at: 100, completedAt: 1_100 }, pool);
    expect(followup).toMatchObject({ phase: "playing", runtime: { towerBlocks: 10, missedWords: 2 } });
  });
});

describe("Venice records and start recommendations", () => {
  it("requires ten regular words and an 80 percent direct-hit rate for a proven level", () => {
    const unstable = run("unstable", 5, [levelStats({ level: 5, spawned: 9, typedCorrectly: 9 })]);
    const stable = run("stable", 5, [levelStats({ level: 5, spawned: 10, typedCorrectly: 8 })]);
    expect(recommendVeniceStartLevel([unstable])).toBe(1);
    expect(recommendVeniceStartLevel([stable])).toBe(6);
  });

  it("uses the median proven level across the last five games and caps at fourteen", () => {
    const histories = [0, 5, 5, 10, 14].map((level, index) => run(
      "run-" + index,
      Math.max(1, level),
      [levelStats({ level: 1, spawned: 0 }), ...(level === 0 ? [] : [levelStats({
        level,
        spawned: 10,
        typedCorrectly: 8,
      })])],
    ));
    expect(recommendVeniceStartLevel(histories)).toBe(6);
    expect(recommendVeniceStartLevel(histories.slice(-1))).toBe(14);
  });

  it("orders top scores by score, then earlier completion, and removes duplicate ids", () => {
    const first = run("first", 1, [levelStats()], { score: 500, completedAt: 1_000 });
    const second = run("second", 1, [levelStats()], { score: 500, completedAt: 2_000 });
    const high = run("high", 1, [levelStats()], { score: 800, completedAt: 3_000 });
    expect(rankVeniceTopScores([second, first, high, first]).map((entry) => entry.id))
      .toEqual(["high", "first", "second"]);
  });
});
