let fallbackSequence = 0;

function timeSeed(): number {
  fallbackSequence = (fallbackSequence + 1) >>> 0;
  const wallClock = Date.now() >>> 0;
  const monotonicClock = typeof performance === "undefined"
    ? 0
    : Math.trunc(performance.now() * 1_000) >>> 0;
  return (wallClock ^ Math.imul(monotonicClock, 0x9e3779b1) ^ fallbackSequence) >>> 0 || 1;
}

export function createRunSeed(): number {
  try {
    const seed = globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    if (seed !== undefined && seed !== 0) return seed;
  } catch {
    // Embedded browser contexts can fall back to clocks when Web Crypto is unavailable.
  }

  return timeSeed();
}
