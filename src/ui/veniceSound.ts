export type VeniceSoundEvent = "typing" | "hit" | "damage" | "game-over";

const tones: Readonly<Record<VeniceSoundEvent, Readonly<{ frequency: number; durationMs: number; wave: OscillatorType }>>> = {
  typing: { frequency: 440, durationMs: 35, wave: "square" },
  hit: { frequency: 740, durationMs: 105, wave: "triangle" },
  damage: { frequency: 180, durationMs: 180, wave: "sawtooth" },
  "game-over": { frequency: 120, durationMs: 320, wave: "triangle" },
};

export function playVeniceSound(event: VeniceSoundEvent, enabled: boolean): void {
  if (!enabled) return;

  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime;
    const tone = tones[event];
    const endAt = startAt + tone.durationMs / 1_000;

    oscillator.type = tone.wave;
    oscillator.frequency.setValueAtTime(tone.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.055, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => { void context.close(); };
    oscillator.start(startAt);
    oscillator.stop(endAt);
  } catch {
    // Audio is optional; a blocked or unsupported device must not interrupt the game.
  }
}
