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

export function trimKoreanLineEnding(lesson: TextLesson): TextLesson {
  if (lesson.language !== "ko" || lesson.mode !== "line") return lesson;
  // Korean line drills should end on the final word rather than its punctuation mark.
  return { ...lesson, text: lesson.text.replace(/\p{P}+$/u, "") };
}

export function textActivities(lessons: readonly TextLesson[]): TextActivity[] {
  const valid = lessons.map(trimKoreanLineEnding).filter((lesson) =>
    lesson.id.trim() && lesson.title.trim() && lesson.text.trim() && !/[\r\n]/.test(lesson.text)
  );
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
