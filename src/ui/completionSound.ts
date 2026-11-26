export function playCompletionTone(): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.14);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => { void context.close(); };
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.15);
  } catch {
    // Audio is optional; a blocked or unsupported device must not interrupt practice.
  }
}

export function playHighScoreTone(): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1_046.5];
    const noteLength = 0.22;

    oscillator.type = "triangle";
    gain.gain.setValueAtTime(0.0001, startAt);
    notes.forEach((frequency, index) => {
      const noteAt = startAt + index * noteLength;
      oscillator.frequency.setValueAtTime(frequency, noteAt);
      gain.gain.setValueAtTime(0.0001, noteAt);
      gain.gain.exponentialRampToValueAtTime(0.055, noteAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteAt + noteLength - 0.02);
    });
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.onended = () => { void context.close(); };
    oscillator.start(startAt);
    oscillator.stop(startAt + notes.length * noteLength);
  } catch {
    // Audio is optional; a blocked or unsupported device must not interrupt practice.
  }
}
