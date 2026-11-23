export const fallbackRandomSeed = 0x9e3779b9;

export function normalizeSeed(seed: number): number {
  const unsigned = Math.trunc(seed) >>> 0;
  return unsigned || fallbackRandomSeed;
}

export function nextRandom(seed: number): { value: number; randomState: number } {
  let state = normalizeSeed(seed);
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  const randomState = state >>> 0 || fallbackRandomSeed;
  return { value: randomState / 0x1_0000_0000, randomState };
}

export function shuffleWithSeed<T>(values: readonly [T, ...T[]], seed: number): [T, ...T[]] {
  const shuffled = [...values];
  let randomState = normalizeSeed(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const random = nextRandom(randomState);
    randomState = random.randomState;
    const otherIndex = Math.floor(random.value * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex]!, shuffled[index]!];
  }

  return shuffled as [T, ...T[]];
}
