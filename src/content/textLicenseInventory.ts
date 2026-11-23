import { activities, challengeWords } from "./library";
import { passageActivities } from "./passages";
import type { Language, TextLesson, TextMode } from "./lessons";

const licenseNames = {
  original: "직접 작성",
  "public-domain": "퍼블릭 도메인",
  "cc-by-sa-4.0": "CC BY-SA 4.0",
} as const;

const textSourceNames = {
  original: "직접 작성",
  quote: "짧은 인용",
  traditional: "격언·속담",
} as const;

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function textLessons(mode: TextMode, language: Language): TextLesson[] {
  return activities.flatMap((activity) =>
    activity.kind === mode ? activity.lessons.filter((lesson) => lesson.language === language) : []
  );
}

function lessonTable(lessons: readonly TextLesson[]): string[] {
  return [
    "| ID | 연습문 | 출처 유형 | 저자·발화자 | 출처 | 원문 |",
    "| --- | --- | --- | --- | --- | --- |",
    ...lessons.map((lesson) => {
      const credit = lesson.credit;
      const author = credit ? escapeCell(credit.author) : "—";
      const source = credit ? escapeCell(credit.source) : "타각 직접 작성";
      const url = credit ? `[열기](${credit.url})` : "—";
      return `| \`${lesson.id}\` | ${escapeCell(lesson.title)} | ${textSourceNames[lesson.source]} | ${author} | ${source} | ${url} |`;
    }),
  ];
}

function textSourceSummary(lessons: readonly TextLesson[]): string {
  return (["original", "quote", "traditional"] as const)
    .map((source) => `${textSourceNames[source]} ${lessons.filter((lesson) => lesson.source === source).length}`)
    .join(" · ");
}

function challengeSection(): string[] {
  return [
    "## 30초 낱말 도전",
    "",
    "모든 도전 낱말은 직접 작성한 원문이다.",
    "",
    `총 ${challengeWords.length}개: ${challengeWords.map((word) => escapeCell(word)).join(", ")}`,
  ];
}

function passageTable(length: "short" | "long", language: Language): string[] {
  const passages = passageActivities.filter((passage) => passage.length === length && passage.language === language);
  return [
    "| ID | 제목 | 장르 | 라이선스 | 저자 | 출처 | 원문 |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...passages.map((passage) => {
      const credit = passage.credit;
      const author = credit ? escapeCell(credit.author) : "—";
      const source = credit ? escapeCell(credit.source) : "자체 제작";
      const url = credit ? `[열기](${credit.url})` : "—";
      return `| \`${passage.id}\` | ${escapeCell(passage.label)} | ${passage.genre} | ${licenseNames[passage.license]} | ${author} | ${source} | ${url} |`;
    }),
  ];
}

/**
 * Builds TEXT-LICENSES.md from the same content modules the app uses. Keeping
 * the document generated means copied passages cannot drift away from their
 * asset-level credit or license metadata.
 */
export function textLicenseMarkdown(): string {
  const koreanLines = textLessons("line", "ko");
  const englishLines = textLessons("line", "en");
  const koreanWords = textLessons("word", "ko");
  const englishWords = textLessons("word", "en");
  const koreanShort = passageActivities.filter((passage) => passage.language === "ko" && passage.length === "short");
  const koreanLong = passageActivities.filter((passage) => passage.language === "ko" && passage.length === "long");
  const englishShort = passageActivities.filter((passage) => passage.language === "en" && passage.length === "short");
  const englishLong = passageActivities.filter((passage) => passage.language === "en" && passage.length === "long");
  const originalPassages = passageActivities.filter((passage) => passage.license === "original").length;
  const copiedPassages = passageActivities.length - originalPassages;

  return [
    "# 연습문 출처와 라이선스",
    "",
    "이 문서는 앱이 실제로 읽는 연습문의 출처와 라이선스 정보를 한곳에 모은 것이다. 한 줄 출처 표기와 글 고르기 목록이 같은 애셋 메타데이터를 사용하도록, 이 파일은 `src/content`의 콘텐츠 모듈에서 자동 생성한다.",
    "",
    "> 이 파일은 직접 고치지 않는다. 애셋을 바꾼 뒤 `npm run text-licenses:update`로 다시 생성하고, `npm run test`로 애셋 메타데이터와의 일치를 확인한다.",
    "",
    "## 요약",
    "",
    "| 자료 묶음 | 개수 | 출처 유형·라이선스 | 애셋 |",
    "| --- | --- | --- | --- |",
    `| 한국어 한 줄 | ${koreanLines.length} | ${textSourceSummary(koreanLines)} | \`src/content/assets/one-line.ko.json\` |`,
    `| 영어 한 줄 | ${englishLines.length} | ${textSourceSummary(englishLines)} | \`src/content/assets/one-line.en.json\` |`,
    `| 한국어 낱말 | ${koreanWords.length} | 직접 작성 | \`src/content/assets/words.ko.json\` |`,
    `| 영어 낱말 | ${englishWords.length} | 직접 작성 | \`src/content/assets/words.en.json\` |`,
    `| 30초 낱말 도전 | ${challengeWords.length} | 직접 작성 | \`src/content/assets/challenge-words.json\` |`,
    `| 한국어 짧은 글 | ${koreanShort.length} | 직접 작성 ${koreanShort.filter((passage) => passage.license === "original").length} · CC BY-SA 4.0 ${koreanShort.filter((passage) => passage.license === "cc-by-sa-4.0").length} · 퍼블릭 도메인 ${koreanShort.filter((passage) => passage.license === "public-domain").length} | \`src/content/assets/passages.ko.json\` |`,
    `| 한국어 긴 글 | ${koreanLong.length} | 직접 작성 ${koreanLong.filter((passage) => passage.license === "original").length} · CC BY-SA 4.0 ${koreanLong.filter((passage) => passage.license === "cc-by-sa-4.0").length} · 퍼블릭 도메인 ${koreanLong.filter((passage) => passage.license === "public-domain").length} | \`src/content/assets/passages.ko.json\` |`,
    `| 영어 짧은 글 | ${englishShort.length} | 직접 작성 ${englishShort.filter((passage) => passage.license === "original").length} · CC BY-SA 4.0 ${englishShort.filter((passage) => passage.license === "cc-by-sa-4.0").length} | \`src/content/assets/passages.en.json\` |`,
    `| 영어 긴 글 | ${englishLong.length} | 직접 작성 ${englishLong.filter((passage) => passage.license === "original").length} · CC BY-SA 4.0 ${englishLong.filter((passage) => passage.license === "cc-by-sa-4.0").length} | \`src/content/assets/passages.en.json\` |`,
    `| **글 전체** | **${passageActivities.length}** | 직접 작성 ${originalPassages} · 복제 ${copiedPassages} | \`src/content/assets/passages.*.json\` |`,
    "",
    "## 라이선스 표기",
    "",
    "- **직접 작성**: 이 프로젝트에서 새로 쓴 원문이다. 별도 출처 표기가 필요 없으며 애셋의 `license`는 `original`이다.",
    "- **짧은 인용**: 애니메이션·게임·영화에서 가져온 짧은 문장이다. 애셋에 작품명, 발화자, HTTPS 출처 URL을 기록하고 한 줄 연습 화면에 출처를 표시한다. 노래 가사와 긴 대사는 포함하지 않는다.",
    "- **격언·속담**: 구전 속담과 오래된 격언이다. 애셋에 전승·저자·참고 출처를 기록하고 한 줄 연습 화면에 표시한다.",
    "- **CC BY-SA 4.0**: 위키문헌·위키백과에서 가져온 발췌문이다. 저자·출처·원문 URL을 애셋의 `credit`에 남기고 글 고르기 목록에 표시한다. 배포 시 같은 라이선스 조건과 출처 표기를 유지한다.",
    "- **퍼블릭 도메인**: 저작권 보호 기간이 끝났거나 법령에 따라 보호받지 않는 자료다. 현재는 대한민국헌법 전문을 사용하며, 애셋에는 출처를 함께 남긴다.",
    "",
    "## 한 줄 연습",
    "",
    `### 한국어 (${koreanLines.length})`,
    "",
    ...lessonTable(koreanLines),
    "",
    `### 영어 (${englishLines.length})`,
    "",
    ...lessonTable(englishLines),
    "",
    "## 낱말 연습",
    "",
    `### 한국어 (${koreanWords.length})`,
    "",
    ...lessonTable(koreanWords),
    "",
    `### 영어 (${englishWords.length})`,
    "",
    ...lessonTable(englishWords),
    "",
    ...challengeSection(),
    "",
    "## 짧은 글",
    "",
    `### 한국어 (${koreanShort.length})`,
    "",
    ...passageTable("short", "ko"),
    "",
    `### 영어 (${englishShort.length})`,
    "",
    ...passageTable("short", "en"),
    "",
    "## 긴 글",
    "",
    `### 한국어 (${koreanLong.length})`,
    "",
    ...passageTable("long", "ko"),
    "",
    `### 영어 (${englishLong.length})`,
    "",
    ...passageTable("long", "en"),
    "",
    "## 새 연습문을 추가할 때",
    "",
    "1. 알맞은 애셋에 항목을 추가한다. 한 줄·낱말·도전 낱말은 `src/content/assets/`의 JSON에 넣는다.",
    "2. 인용·전승 한 줄에는 `source`와 저자·출처·HTTPS URL을 담은 `credit`을 함께 적는다. 직접 작성한 한 줄은 기존처럼 `source: \"original\"`로 둔다. 복제 글(짧은 글·긴 글)에는 `license`와 `credit`을 함께 적고, 직접 작성한 글은 `license: \"original\"`과 `credit: null`을 쓴다. 출처 메타데이터가 불완전한 자료는 앱이 읽지 않는다.",
    "3. 발췌문은 제목에 `(발췌)`를 붙이고, 그림 캡션·각주·목록 기호·HTML 엔티티 같은 추출 잔여물을 제거한다. 복제 글은 완결된 문장으로 끝낸다.",
    "4. `npm run text-licenses:update`로 이 문서를 다시 생성한다.",
    "5. `npm run test`와 `npm run build`를 실행한다. `src/content/textLicenseInventory.test.ts`가 이 문서와 애셋의 개수·제목·라이선스·저자·출처·URL이 일치하는지 검사하고, 기존 콘텐츠 테스트가 길이·문장 종료·출처 필수 규칙을 확인한다.",
    "",
    "## 검증과 수정",
    "",
    "- 검증: `npm run test`에 포함된 `src/content/textLicenseInventory.test.ts`가 `TEXT-LICENSES.md`를 현재 애셋에서 다시 만든 내용과 비교한다. 문서가 오래되면 테스트가 실패한다.",
    "- 수정: `npm run text-licenses:update`가 같은 모듈로 문서를 다시 쓴다. 손으로 표를 고치지 않는다.",
    "- 한 줄 연습의 출처 표기는 `TextLesson`의 `source`·`credit`을, 글 연습의 출처 표기는 `passageActivities`의 `license`·`credit`을 그대로 사용하므로, 애셋이 이 문서의 원본이다.",
    "",
  ].join("\n");
}
