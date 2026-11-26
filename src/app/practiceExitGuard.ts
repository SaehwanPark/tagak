import { splitCharacters } from "../domain/typing";
import type { PracticeContentState } from "./usePractice";

const meaningfulInputGraphemes = 10;

function hasMeaningfulInput(input: string, prompt: string): boolean {
  const promptLength = splitCharacters(prompt).length;
  if (promptLength === 0) return false;
  const threshold = Math.min(meaningfulInputGraphemes, promptLength);
  return splitCharacters(input).length >= threshold;
}

export function shouldConfirmPracticeExit(state: PracticeContentState): boolean {
  if (state.screen === "practice") {
    return state.completedLineScores.length > 0 || hasMeaningfulInput(state.session.input, state.lesson.text);
  }
  if (state.screen === "passage") {
    const prompt = state.activity.lines[state.session.lineIndex] ?? "";
    return state.session.lineScores.length > 0 || hasMeaningfulInput(state.session.line.input, prompt);
  }
  return false;
}
