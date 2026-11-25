export type Language = "ko" | "en";
export type TextMode = "line";
export type NonEmpty<T> = readonly [T, ...T[]];

export type TextSource = "original" | "quote" | "traditional";

export type TextCredit = {
  author: string;
  source: string;
  url: string;
};

export type TextLesson = {
  id: string;
  title: string;
  mode: TextMode;
  language: Language;
  source: TextSource;
  credit: TextCredit | null;
  text: string;
};

export type TextActivity = {
  id: string;
  kind: TextMode;
  label: string;
  lessons: NonEmpty<TextLesson>;
};

export type Activity = TextActivity;

export function prepareLineText(text: string, language: Language): string | null {
  const expectedLetter = language === "ko" ? /\p{Script=Hangul}/u : /\p{Script=Latin}/u;
  const hasForeignLetter = Array.from(text).some((character) =>
    /\p{L}/u.test(character) && !expectedLetter.test(character)
  );
  if (hasForeignLetter) return null;

  const allowedCharacters = language === "ko"
    ? /[^\p{Script=Hangul}\p{White_Space}]/gu
    : /[^\p{Script=Latin}\p{White_Space}]/gu;
  return text.replace(/\p{P}+/gu, "")
    .replace(allowedCharacters, " ")
    .replace(/\p{White_Space}+/gu, " ")
    .trim();
}

export function textActivities(lessons: readonly TextLesson[]): TextActivity[] {
  const valid = lessons.flatMap((lesson) => {
    if (!lesson.id.trim() || !lesson.title.trim() || !lesson.text.trim() || /[\r\n]/.test(lesson.text)) return [];
    const text = prepareLineText(lesson.text, lesson.language);
    if (!text || text.split(" ").length < 4) return [];
    return [{ ...lesson, text }];
  });
  const languages = ["ko", "en"] as const;

  return languages.flatMap<TextActivity>((language) => {
    const [first, ...rest] = valid.filter((lesson) => lesson.language === language && lesson.mode === "line");
    return first ? [{
      id: `${language}-line`,
      kind: "line",
      label: "한 줄",
      lessons: [first, ...rest],
    }] : [];
  });
}
