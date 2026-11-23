import { countKoreanKeystrokes, normalizeInput } from "./typing";
import { nextRandom, normalizeSeed } from "./random";

export const veniceLevelCount = 14;
export const veniceTowerBlockCount = 12;
export const veniceStageQuota = 20;
export const veniceRulesVersion = 1;
export const veniceRecentRunLimit = 30;
export const veniceTopScoreLimit = 10;
export const veniceHideDurationMs = 5_000;
export const veniceHidePhaseMs = 1_500;

export type VeniceEffect =
  | "clear"
  | "freeze"
  | "repair"
  | "haste"
  | "slow"
  | "hide"
  | "swarm"
  | "mine"
  | "infection";

export type VeniceWord = Readonly<{ text: string; keystrokes: number; minimumLevel?: number }>;
export type VeniceWordKind = "regular" | "virus";
export type VeniceStageConfig = Readonly<{
  level: number;
  spawnIntervalMs: number;
  fallDurationMs: number;
  maxActive: number;
  minSyllables: number;
  maxSyllables: number;
  specialChance: number;
}>;

export type FallingWord = Readonly<{
  id: number;
  order: number;
  text: string;
  keystrokes: number;
  lane: number;
  y: number;
  kind: VeniceWordKind;
  effect: VeniceEffect | null;
}>;

export type VeniceLevelStats = Readonly<{
  level: number;
  spawned: number;
  typedCorrectly: number;
  missed: number;
  durationMs: number;
}>;

export type VeniceRun = Readonly<{
  id: string;
  rulesVersion: number;
  startedAt: number;
  completedAt: number;
  startLevel: number;
  highestLevel: number;
  score: number;
  typedWords: number;
  missedWords: number;
  durationMs: number;
  levelStats: readonly VeniceLevelStats[];
}>;

export type VeniceRuntime = Readonly<{
  startLevel: number;
  runId: string;
  level: number;
  highestLevel: number;
  score: number;
  towerBlocks: number;
  usedWordTexts: readonly string[];
  words: readonly FallingWord[];
  mines: readonly Readonly<{ id: number; lane: number; y: number; expiresAt: number }>[];
  input: string;
  message: VeniceEffect | "mismatch" | null;
  infectionActive: boolean;
  effects: Readonly<Partial<Record<"freeze" | "haste" | "slow" | "hide", number>>>;
  startedAt: number;
  startedAtWallClock: number;
  lastAt: number;
  elapsedMs: number;
  nextSpawnAt: number;
  nextId: number;
  randomState: number;
  typedWords: number;
  missedWords: number;
  levelStats: readonly VeniceLevelStats[];
}>;

export type VeniceState =
  | Readonly<{ phase: "ready"; startLevel: number; recommendedLevel: number }>
  | Readonly<{ phase: "playing"; runtime: VeniceRuntime }>
  | Readonly<{ phase: "paused"; runtime: VeniceRuntime }>
  | Readonly<{ phase: "finished"; run: VeniceRun }>;

export type VeniceAction =
  | Readonly<{ type: "select-level"; level: number }>
  | Readonly<{ type: "start"; at: number; startedAt: number; seed: number; id: string }>
  | Readonly<{ type: "input"; input: string }>
  | Readonly<{ type: "submit" }>
  | Readonly<{ type: "tick"; at: number; completedAt: number }>
  | Readonly<{ type: "pause" }>
  | Readonly<{ type: "resume"; at: number }>
  | Readonly<{ type: "finish"; completedAt: number }>
  | Readonly<{ type: "return-to-ready"; recentRuns: readonly VeniceRun[] }>;

const maximumFrameMs = 100;
const effectWeights: Readonly<Record<VeniceEffect, number>> = {
  clear: 12,
  freeze: 12,
  repair: 8,
  haste: 12,
  slow: 12,
  hide: 12,
  swarm: 14,
  mine: 12,
  infection: 6,
};

const stageDesign: readonly VeniceStageConfig[] = [
  { level: 1, spawnIntervalMs: 3_000, fallDurationMs: 9_000, maxActive: 4, minSyllables: 2, maxSyllables: 4, specialChance: 0.07 },
  { level: 2, spawnIntervalMs: 2_592, fallDurationMs: 8_038, maxActive: 4, minSyllables: 2, maxSyllables: 4, specialChance: 0.08 },
  { level: 3, spawnIntervalMs: 2_215, fallDurationMs: 7_133, maxActive: 5, minSyllables: 2, maxSyllables: 4, specialChance: 0.08 },
  { level: 4, spawnIntervalMs: 1_913, fallDurationMs: 6_375, maxActive: 5, minSyllables: 2, maxSyllables: 5, specialChance: 0.09 },
  { level: 5, spawnIntervalMs: 1_643, fallDurationMs: 5_680, maxActive: 6, minSyllables: 2, maxSyllables: 5, specialChance: 0.09 },
  { level: 6, spawnIntervalMs: 1_413, fallDurationMs: 5_067, maxActive: 6, minSyllables: 2, maxSyllables: 5, specialChance: 0.1 },
  { level: 7, spawnIntervalMs: 1_383, fallDurationMs: 4_515, maxActive: 7, minSyllables: 3, maxSyllables: 6, specialChance: 0.1 },
  { level: 8, spawnIntervalMs: 1_184, fallDurationMs: 4_016, maxActive: 7, minSyllables: 3, maxSyllables: 6, specialChance: 0.1 },
  { level: 9, spawnIntervalMs: 1_017, fallDurationMs: 3_586, maxActive: 8, minSyllables: 3, maxSyllables: 6, specialChance: 0.11 },
  { level: 10, spawnIntervalMs: 871, fallDurationMs: 3_195, maxActive: 8, minSyllables: 3, maxSyllables: 6, specialChance: 0.11 },
  { level: 11, spawnIntervalMs: 795, fallDurationMs: 2_845, maxActive: 9, minSyllables: 3, maxSyllables: 7, specialChance: 0.12 },
  { level: 12, spawnIntervalMs: 680, fallDurationMs: 2_536, maxActive: 9, minSyllables: 3, maxSyllables: 7, specialChance: 0.12 },
  { level: 13, spawnIntervalMs: 599, fallDurationMs: 2_260, maxActive: 10, minSyllables: 4, maxSyllables: 8, specialChance: 0.13 },
  { level: 14, spawnIntervalMs: 512, fallDurationMs: 2_015, maxActive: 10, minSyllables: 4, maxSyllables: 8, specialChance: 0.14 },
];

function safeLevel(level: number): number {
  return Number.isFinite(level)
    ? Math.min(veniceLevelCount, Math.max(1, Math.trunc(level)))
    : 1;
}

export function targetCpm(level: number): number {
  const levelNumber = safeLevel(level);
  return Math.round(100 * 10 ** ((levelNumber - 1) / 13));
}

export function veniceStageConfig(level: number): VeniceStageConfig {
  return stageDesign[safeLevel(level) - 1] ?? stageDesign[0]!;
}

export function candidateVeniceWords(pool: readonly VeniceWord[], level: number): readonly VeniceWord[] {
  const config = veniceStageConfig(level);
  return pool.filter((word) => {
    const syllableCount = Array.from(word.text).length;
    return (word.minimumLevel ?? 1) <= level
      && syllableCount >= config.minSyllables
      && syllableCount <= config.maxSyllables;
  });
}

export function availableVeniceWords(
  pool: readonly VeniceWord[],
  level: number,
  usedWordTexts: readonly string[],
): readonly VeniceWord[] {
  const candidates = candidateVeniceWords(pool, level);
  const eligible = candidates.length > 0 ? candidates : pool;
  const used = new Set(usedWordTexts);
  const unused = eligible.filter((word) => !used.has(word.text));
  return unused.length > 0 ? unused : eligible;
}

export function scoreVeniceWord(word: string, level: number): number {
  const levelNumber = safeLevel(level);
  const multiplier = 10 ** ((levelNumber - 1) / 13);
  return Math.round(10 * countKoreanKeystrokes(word) * multiplier);
}

export function spawnIntervalMs(level: number): number {
  return veniceStageConfig(level).spawnIntervalMs;
}

export function fallDurationMs(level: number): number {
  return veniceStageConfig(level).fallDurationMs;
}

export function isVeniceWordHidden(wordId: number, runtime: Pick<VeniceRuntime, "elapsedMs" | "effects">): boolean {
  const expiresAt = runtime.effects.hide;
  if (expiresAt === undefined || expiresAt <= runtime.elapsedMs || wordId % 2 !== 0) return false;
  const startedAt = expiresAt - veniceHideDurationMs;
  const phase = Math.floor((runtime.elapsedMs - startedAt) / veniceHidePhaseMs);
  return phase % 2 === 0;
}

export function createVeniceReady(recentRuns: readonly VeniceRun[] = []): VeniceState {
  const recommendedLevel = recommendVeniceStartLevel(recentRuns);
  return { phase: "ready", startLevel: recommendedLevel, recommendedLevel };
}

export function recommendVeniceStartLevel(runs: readonly VeniceRun[]): number {
  const recent = runs.slice(-5);
  const provenLevels = recent.map((run) => Math.max(0, ...run.levelStats
    .filter((stats) => stats.spawned >= 10 && stats.typedCorrectly >= stats.spawned * 0.8)
    .map((stats) => stats.level)));
  if (provenLevels.length === 0) return 1;
  const sorted = [...provenLevels].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1
    ? sorted[middle] ?? 0
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  return Math.min(veniceLevelCount, Math.max(1, Math.floor(median + 1)));
}

export function rankVeniceTopScores(runs: readonly VeniceRun[]): VeniceRun[] {
  const unique = [...new Map(runs.map((run) => [run.id, run])).values()];
  return unique
    .sort((left, right) => right.score - left.score
      || left.completedAt - right.completedAt
      || left.id.localeCompare(right.id))
    .slice(0, veniceTopScoreLimit);
}

function randomIndex(runtime: VeniceRuntime, length: number): { index: number; randomState: number } {
  const random = nextRandom(runtime.randomState);
  return { index: Math.floor(random.value * length), randomState: random.randomState };
}

function weightedEffect(runtime: VeniceRuntime): { effect: VeniceEffect; randomState: number } {
  const random = nextRandom(runtime.randomState);
  const totalWeight = Object.values(effectWeights).reduce((total, weight) => total + weight, 0);
  let threshold = random.value * totalWeight;
  for (const [effect, weight] of Object.entries(effectWeights) as [VeniceEffect, number][]) {
    threshold -= weight;
    if (threshold < 0) return { effect, randomState: random.randomState };
  }
  return { effect: "infection", randomState: random.randomState };
}

function initialStats(level: number): VeniceLevelStats {
  return { level, spawned: 0, typedCorrectly: 0, missed: 0, durationMs: 0 };
}

function currentStats(runtime: VeniceRuntime): VeniceLevelStats {
  return runtime.levelStats[runtime.levelStats.length - 1] ?? initialStats(runtime.level);
}

function withCurrentStats(runtime: VeniceRuntime, stats: VeniceLevelStats): VeniceRuntime {
  const levelStats = [...runtime.levelStats];
  if (levelStats.length === 0) levelStats.push(stats);
  else levelStats[levelStats.length - 1] = stats;
  return { ...runtime, levelStats };
}

export function startVeniceGame(level: number, at: number, startedAt: number, seed: number, id: string): VeniceState {
  const levelNumber = safeLevel(level);
  const safeAt = Number.isFinite(at) ? Math.max(0, at) : 0;
  const runtime: VeniceRuntime = {
    startLevel: levelNumber,
    runId: id,
    level: levelNumber,
    highestLevel: levelNumber,
    score: 0,
    towerBlocks: veniceTowerBlockCount,
    usedWordTexts: [],
    words: [],
    mines: [],
    input: "",
    message: null,
    infectionActive: false,
    effects: {},
    startedAt: safeAt,
    startedAtWallClock: Number.isFinite(startedAt) ? Math.max(0, startedAt) : 0,
    lastAt: safeAt,
    elapsedMs: 0,
    nextSpawnAt: spawnIntervalMs(levelNumber),
    nextId: 1,
    randomState: normalizeSeed(seed),
    typedWords: 0,
    missedWords: 0,
    levelStats: [initialStats(levelNumber)],
  };
  return { phase: "playing", runtime };
}

function selectLane(runtime: VeniceRuntime): { lane: number; randomState: number } {
  const counts = Array.from({ length: 7 }, (_, lane) => runtime.words.filter((word) => word.lane === lane).length);
  const least = Math.min(...counts);
  const candidates = counts.flatMap((count, lane) => count === least ? [lane] : []);
  const choice = randomIndex(runtime, candidates.length);
  return { lane: candidates[choice.index] ?? 0, randomState: choice.randomState };
}

function addWord(
  runtime: VeniceRuntime,
  pool: readonly VeniceWord[],
  kind: VeniceWordKind,
  effect: VeniceEffect | null,
): VeniceRuntime {
  if (pool.length === 0) return runtime;
  const words = availableVeniceWords(pool, runtime.level, runtime.usedWordTexts);
  const selectedWord = randomIndex(runtime, words.length);
  const afterWord = { ...runtime, randomState: selectedWord.randomState };
  const selectedLane = selectLane(afterWord);
  const word = words[selectedWord.index] ?? words[0];
  if (!word) return runtime;
  const nextId = runtime.nextId;
  return {
    ...runtime,
    randomState: selectedLane.randomState,
    nextId: nextId + 1,
    usedWordTexts: runtime.usedWordTexts.includes(word.text)
      ? runtime.usedWordTexts
      : [...runtime.usedWordTexts, word.text],
    words: [...runtime.words, {
      id: nextId,
      order: nextId,
      text: word.text,
      keystrokes: word.keystrokes,
      lane: selectedLane.lane,
      y: 0,
      kind,
      effect,
    }],
  };
}

function damageTower(runtime: VeniceRuntime): VeniceRuntime {
  const towerBlocks = Math.max(0, runtime.towerBlocks - 1);
  return { ...runtime, towerBlocks };
}

function finishRuntime(runtime: VeniceRuntime, completedAt: number): VeniceRun {
  return {
    id: runtime.runId,
    rulesVersion: veniceRulesVersion,
    startedAt: runtime.startedAtWallClock,
    completedAt: Math.max(runtime.startedAtWallClock, completedAt),
    startLevel: runtime.startLevel,
    highestLevel: runtime.highestLevel,
    score: runtime.score,
    typedWords: runtime.typedWords,
    missedWords: runtime.missedWords,
    durationMs: runtime.elapsedMs,
    levelStats: runtime.levelStats,
  };
}

function finishState(runtime: VeniceRuntime, completedAt: number): VeniceState {
  return { phase: "finished", run: finishRuntime(runtime, completedAt) };
}

function updateLevelStat(
  runtime: VeniceRuntime,
  update: (stats: VeniceLevelStats) => VeniceLevelStats,
): VeniceRuntime {
  return withCurrentStats(runtime, update(currentStats(runtime)));
}

function resolveWord(runtime: VeniceRuntime, word: FallingWord, pool: readonly VeniceWord[]): VeniceRuntime {
  let remaining = runtime.words.filter((candidate) => candidate.id !== word.id);
  let next: VeniceRuntime = { ...runtime, words: remaining, input: "", message: word.effect };
  if (word.kind === "regular") {
    next = updateLevelStat(next, (stats) => ({ ...stats, typedCorrectly: stats.typedCorrectly + 1 }));
  }
  next = {
    ...next,
    typedWords: next.typedWords + 1,
    score: next.score + scoreVeniceWord(word.text, runtime.level),
  };

  switch (word.effect) {
    case "clear":
      remaining = [];
      next = { ...next, words: remaining };
      break;
    case "freeze":
      next = { ...next, effects: { ...next.effects, freeze: next.elapsedMs + 3_000 } };
      break;
    case "haste":
    case "slow":
      next = { ...next, effects: { ...next.effects, [word.effect]: next.elapsedMs + 5_000 } };
      break;
    case "hide":
      next = { ...next, effects: { ...next.effects, hide: next.elapsedMs + veniceHideDurationMs } };
      break;
    case "repair":
      next = { ...next, towerBlocks: Math.min(veniceTowerBlockCount, next.towerBlocks + 4) };
      break;
    case "swarm": {
      const maximumActive = veniceStageConfig(next.level).maxActive;
      const remainingQuota = next.level === veniceLevelCount
        ? 3
        : veniceStageQuota - currentStats(next).spawned;
      const available = Math.max(0, Math.min(3, remainingQuota, maximumActive - next.words.length));
      for (let index = 0; index < available; index += 1) {
        const beforeCount = next.words.length;
        next = addWord(next, pool, "regular", null);
        if (next.words.length > beforeCount) {
          next = updateLevelStat(next, (stats) => ({ ...stats, spawned: stats.spawned + 1 }));
        }
      }
      break;
    }
    case "mine": {
      const laneChoice = randomIndex(next, 7);
      next = {
        ...next,
        randomState: laneChoice.randomState,
        nextId: next.nextId + 1,
        mines: [...next.mines, {
          id: next.nextId,
          lane: laneChoice.index,
          y: 58,
          expiresAt: next.elapsedMs + 8_000,
        }],
      };
      break;
    }
    case "infection":
      next = { ...next, infectionActive: false };
      break;
    case null:
      break;
  }
  return next;
}

function spawnScheduledWord(runtime: VeniceRuntime, pool: readonly VeniceWord[]): VeniceRuntime {
  const stats = currentStats(runtime);
  if ((runtime.level < veniceLevelCount && stats.spawned >= veniceStageQuota)
    || runtime.words.length >= veniceStageConfig(runtime.level).maxActive) {
    return runtime;
  }
  const choice = nextRandom(runtime.randomState);
  let next = { ...runtime, randomState: choice.randomState };
  if (choice.value < veniceStageConfig(runtime.level).specialChance) {
    const effect = weightedEffect(next);
    next = { ...next, randomState: effect.randomState };
    return addWord(next, pool, "virus", effect.effect);
  }
  const beforeCount = next.words.length;
  next = addWord(next, pool, "regular", null);
  return next.words.length === beforeCount
    ? next
    : updateLevelStat(next, (current) => ({ ...current, spawned: current.spawned + 1 }));
}

function handleMiss(runtime: VeniceRuntime, word: FallingWord): VeniceRuntime {
  let next: VeniceRuntime = {
    ...runtime,
    words: runtime.words.filter((candidate) => candidate.id !== word.id),
    missedWords: runtime.missedWords + 1,
  };
  if (word.kind === "regular") {
    next = updateLevelStat(next, (stats) => ({ ...stats, missed: stats.missed + 1 }));
    return damageTower(next);
  }
  if (word.effect === "infection") {
    return damageTower({ ...next, infectionActive: true });
  }
  return next.infectionActive ? damageTower(next) : next;
}

function advanceLevel(runtime: VeniceRuntime): VeniceRuntime {
  const level = runtime.level + 1;
  return {
    ...runtime,
    level,
    highestLevel: Math.max(runtime.highestLevel, level),
    words: [],
    mines: [],
    effects: {},
    infectionActive: false,
    nextSpawnAt: runtime.elapsedMs + spawnIntervalMs(level),
    levelStats: [...runtime.levelStats, initialStats(level)],
  };
}

function tickRuntime(runtime: VeniceRuntime, at: number, pool: readonly VeniceWord[], completedAt: number): VeniceState {
  const delta = Math.min(maximumFrameMs, Math.max(0, at - runtime.lastAt));
  const elapsedMs = runtime.elapsedMs + delta;
  let next: VeniceRuntime = {
    ...runtime,
    lastAt: Math.max(runtime.lastAt, at),
    elapsedMs,
    input: runtime.input,
    message: runtime.message,
    mines: runtime.mines.filter((mine) => mine.expiresAt > elapsedMs),
    effects: Object.fromEntries(Object.entries(runtime.effects).filter(([, expiry]) => expiry !== undefined && expiry > elapsedMs)),
    levelStats: runtime.levelStats.map((stats, index) => index === runtime.levelStats.length - 1
      ? { ...stats, durationMs: stats.durationMs + delta }
      : stats),
  };

  const frozen = (next.effects.freeze ?? 0) > elapsedMs;
  if (!frozen) {
    const fallMultiplier = (next.effects.haste ?? 0) > elapsedMs ? 1.4
      : (next.effects.slow ?? 0) > elapsedMs ? 0.65 : 1;
    const movement = (delta / fallDurationMs(runtime.level)) * 100 * fallMultiplier;
    next = { ...next, words: runtime.words.map((word) => ({ ...word, y: word.y + movement })) };
  }

  const remainingMines = [...next.mines];
  const survivors: FallingWord[] = [];
  for (const word of next.words) {
    const mineIndex = remainingMines.findIndex((mine) => mine.lane === word.lane && word.y >= mine.y);
    if (mineIndex >= 0) remainingMines.splice(mineIndex, 1);
    else survivors.push(word);
  }
  next = { ...next, words: survivors, mines: remainingMines };

  for (const word of [...next.words].filter((candidate) => candidate.y >= 75)) {
    next = handleMiss(next, word);
  }
  if (next.towerBlocks === 0) return finishState(next, completedAt);

  if (next.level < veniceLevelCount && currentStats(next).spawned >= veniceStageQuota && next.words.length === 0) {
    next = advanceLevel(next);
  }

  if (elapsedMs >= next.nextSpawnAt) {
    const stats = currentStats(next);
    if (next.level === veniceLevelCount || stats.spawned < veniceStageQuota) {
      next = spawnScheduledWord(next, pool);
    }
    next = { ...next, nextSpawnAt: elapsedMs + spawnIntervalMs(next.level) };
  }
  return { phase: "playing", runtime: next };
}

function matchingWord(runtime: VeniceRuntime): FallingWord | null {
  const matches = runtime.words.filter((word) => word.text === runtime.input);
  return matches.sort((left, right) => right.y - left.y || left.order - right.order)[0] ?? null;
}

export function reduceVeniceState(
  state: VeniceState,
  action: VeniceAction,
  pool: readonly VeniceWord[],
): VeniceState {
  if (state.phase === "ready") {
    if (action.type === "select-level") {
      return { ...state, startLevel: safeLevel(action.level) };
    }
    if (action.type === "start") return startVeniceGame(state.startLevel, action.at, action.startedAt, action.seed, action.id);
    if (action.type === "return-to-ready") return createVeniceReady(action.recentRuns);
    return state;
  }
  if (state.phase === "finished") {
    if (action.type === "return-to-ready") return createVeniceReady(action.recentRuns);
    if (action.type === "start") return startVeniceGame(state.run.startLevel, action.at, action.startedAt, action.seed, action.id);
    return state;
  }
  if (state.phase === "paused") {
    if (action.type === "resume") return { phase: "playing", runtime: { ...state.runtime, lastAt: action.at } };
    if (action.type === "finish") return finishState(state.runtime, action.completedAt);
    return state;
  }

  switch (action.type) {
    case "input":
      return { phase: "playing", runtime: { ...state.runtime, input: normalizeInput(action.input).slice(0, 32), message: null } };
    case "submit": {
      const matched = matchingWord(state.runtime);
      if (!matched) return { phase: "playing", runtime: { ...state.runtime, input: "", message: "mismatch" } };
      const runtime = resolveWord(state.runtime, matched, pool);
      return { phase: "playing", runtime };
    }
    case "tick":
      return tickRuntime(state.runtime, action.at, pool, action.completedAt);
    case "pause":
      return { phase: "paused", runtime: state.runtime };
    case "finish":
      return finishState(state.runtime, action.completedAt);
    case "return-to-ready":
      return state;
    case "select-level":
    case "start":
      return state;
  }
  return state;
}

export function shouldRecordVeniceRun(run: VeniceRun): boolean {
  return run.typedWords + run.missedWords > 0;
}

export function calculateVeniceWord(text: string): VeniceWord {
  return { text: normalizeInput(text), keystrokes: countKoreanKeystrokes(text) };
}
