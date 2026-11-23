import type { Activity, Language, NonEmpty, TextCredit, TextLesson, TextMode, TextSource } from "./lessons";
import { textActivities } from "./lessons";
import rawKoreanLines from "./assets/one-line.ko.json" with { type: "json" };
import rawEnglishLines from "./assets/one-line.en.json" with { type: "json" };
import rawKoreanWords from "./assets/words.ko.json" with { type: "json" };
import rawEnglishWords from "./assets/words.en.json" with { type: "json" };
import rawChallengeWords from "./assets/challenge-words.json" with { type: "json" };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCredit(value: unknown): TextCredit | null | undefined {
  if (value === undefined || value === null) return null;
  if (!isObject(value)) return undefined;
  const { author, source, url } = value;
  if (typeof author !== "string" || !author.trim()) return undefined;
  if (typeof source !== "string" || !source.trim()) return undefined;
  if (typeof url !== "string" || !url.trim()) return undefined;
  try {
    if (new URL(url).protocol !== "https:") return undefined;
  } catch {
    return undefined;
  }
  return { author, source, url };
}

function isTextSource(value: unknown): value is TextSource {
  return value === "original" || value === "quote" || value === "traditional";
}

function readLessons(value: unknown, language: Language, mode: TextMode): TextLesson[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isObject(entry)) return [];
    const { id, title, text } = entry;
    if (typeof id !== "string" || !id.trim()) return [];
    if (typeof title !== "string" || !title.trim()) return [];
    if (typeof text !== "string" || !text.trim() || /[\r\n]/.test(text)) return [];
    const source = entry.source === undefined ? "original" : entry.source;
    if (!isTextSource(source)) return [];
    const credit = readCredit(entry.credit);
    if (credit === undefined || (source !== "original" && !credit) || (source === "original" && credit)) return [];
    return [{ id, title, text, language, mode, source, credit }];
  });
}

const sourceLessons: readonly TextLesson[] = [
  ...readLessons(rawKoreanLines, "ko", "line"),
  ...readLessons(rawEnglishLines, "en", "line"),
  ...readLessons(rawKoreanWords, "ko", "word"),
  ...readLessons(rawEnglishWords, "en", "word"),
];

export const firstKoreanLesson: TextLesson = sourceLessons[0] ?? {
  id: "first-steps",
  title: "손끝에 다시 익숙해지기",
  mode: "line",
  language: "ko",
  source: "original",
  credit: null,
  text: "한글을 한 줄씩 입력하면 손끝에 작은 리듬이 돌아옵니다",
};

export const activities: readonly Activity[] = [
  // Position practice anchors the menu as the first step for new typists.
  {
    id: "ko-positions",
    kind: "position",
    label: "두벌식 자리 연습",
    keys: ["KeyF", "KeyJ", "KeyD", "KeyK", "KeyS", "KeyL", "KeyA", "KeyG", "KeyH"],
  },
  ...textActivities(sourceLessons),
];

const words = Array.isArray(rawChallengeWords)
  ? rawChallengeWords.filter((word): word is string => typeof word === "string" && word.trim().length > 0)
  : [];
export const challengeWords: NonEmpty<string> = [words[0] ?? "바람", ...words.slice(1)];
