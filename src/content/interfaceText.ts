import type { Language } from "./lessons";
import type { TypingSpeedUnit } from "../domain/typingSpeed";

/** Home-menu groups keep practice, game, and utility entries visually distinct. */
export type MenuCategory = "practice" | "game" | "other";

export type InterfaceText = Readonly<{
  brand: string;
  typingPractice: string;
  menu: string;
  back: string;
  settings: string;
  backToMenu: string;
  backToSettings: string;
  start: string;
  navigationHint: string;
  screenCapture: string;
  saving: string;
  captureDisclosure: string;
  interfaceLanguage: string;
  practiceLanguage: string;
  practiceLanguageAfterMenu: string;
  koreanSpeedUnit: string;
  englishSpeedUnit: string;
  speedUnitCpm: (language: Language) => string;
  speedUnitWpm: string;
  speedUnitHelp: string;
  speedLabel: (unit: TypingSpeedUnit, language: Language) => string;
  speedValue: (value: number, unit: TypingSpeedUnit, language: Language) => string;
  korean: string;
  english: string;
  practiceSize: string;
  resetSize: string;
  standardSize: string;
  largeSize: string;
  largestSize: string;
  colorTheme: string;
  resetTheme: string;
  terminalTheme: string;
  paperTheme: string;
  practiceFont: string;
  resetFont: string;
  gothicFont: string;
  serifFont: string;
  completionSound: string;
  completionSoundHelp: string;
  soundOn: string;
  soundOff: string;
  resetSettings: string;
  settingsHelp: string;
  saveFailed: string;
  invalidSettings: string;
  chooseShortPassage: string;
  chooseLongPassage: string;
  shortPassage: string;
  longPassage: string;
  choosePractice: string;
  select: string;
  firstLast: string;
  currentPrompt: string;
  sourceLabel: string;
  openSource: (source: string) => string;
  originalLineSource: string;
  followAlong: string;
  submit: string;
  spaceSubmitHint: string;
  finishPractice: string;
  currentScore: string;
  previousSentence: string;
  previousScore: string;
  accuracy: string;
  elapsedTime: string;
  result: string;
  practiceComplete: string;
  thisResult: string;
  sameModePrevious: string;
  previousResult: string;
  practiceAgain: string;
  nextWord: string;
  wordProgress: (index: number, total: number) => string;
  lineSessionProgress: (current: number, total: number) => string;
  lineSessionCompleted: (count: number) => string;
  lineSessionResult: string;
  lineSessionStatistics: string;
  lineSessionSampleCount: (count: number) => string;
  mean: string;
  standardDeviation: string;
  median: string;
  interquartileRange: string;
  returnTo: (destination: string) => string;
  openPractice: string;
  blockedPracticeInput: string;
  remainingCharacters: (count: number) => string;
  noRecords: string;
  practiceKind: string;
  all: string;
  clearHistory: string;
  confirmClearHistory: string;
  clearAllHistory: string;
  cancel: string;
  historySaveFailed: string;
  historyClearFailed: string;
  historyCleared: string;
  historyReadFailed: string;
  accuracyValue: (value: number) => string;
  challengeTitle: string;
  challengeInstruction: string;
  challengeStart: string;
  challengeResult: string;
  timeEnded: string;
  challengeStopped: string;
  solvedWords: string;
  solvedWordCount: (count: number) => string;
  elapsedTimeValue: (seconds: string) => string;
  retryChallenge: string;
  remainingTime: (seconds: number) => string;
  enterWord: string;
  stopChallenge: string;
  blockedWordInput: string;
  retryWord: string;
  veniceTitle: string;
  veniceInstruction: string;
  veniceCollisionLine: string;
  veniceLevel: string;
  veniceRecommended: (level: number) => string;
  veniceStart: string;
  veniceReadyHint: string;
  veniceTargetCpm: string;
  veniceScore: string;
  veniceTower: string;
  veniceStageProgress: (spawned: number, total: number) => string;
  veniceEndlessProgress: (spawned: number) => string;
  veniceInputLabel: string;
  veniceSubmit: string;
  veniceFinish: string;
  venicePaused: string;
  venicePause: string;
  veniceResume: string;
  veniceMismatch: string;
  veniceEffectLabel: (effect: string) => string;
  veniceInfectionActive: string;
  veniceResult: string;
  venicePlayAgain: string;
  veniceChooseLevel: string;
  veniceStartLevel: string;
  veniceHighestLevel: string;
  veniceTypedWords: string;
  veniceMissedWords: string;
  veniceTopScores: string;
  veniceRank: string;
  veniceDate: string;
  veniceNoScores: string;
  veniceSaveFailed: string;
  veniceReadFailed: string;
  freePractice: string;
  freePracticeLabel: string;
  freePracticeHint: string;
  newline: string;
  positionPractice: string;
  positionInstruction: string;
  tryAgain: string;
  nextKey: string;
  passagePage: (page: number, total: number) => string;
  charactersSuffix: string;
  passageCurrentLine: string;
  passageCompletedLine: string;
  passageNextLine: string;
  passageBundleScore: string;
  genreLabel: (genre: string) => string;
  licenseLabel: (license: string) => string;
  screenCaptureError: string;
  screenCaptureSuccess: string;
  screenCaptureUnsupported: string;
  dataTransferTitle: string;
  dataTransferDescription: string;
  backupExport: string;
  backupImport: string;
  backupContents: string;
  backupChooseFile: string;
  backupFormatError: string;
  backupReadError: string;
  backupExportSuccess: string;
  backupExportError: string;
  backupConflict: string;
  backupMerge: string;
  backupReplace: string;
  backupImportSuccess: string;
  backupReplaceSuccess: string;
  backupRestoreError: string;
  backupCurrentDataError: string;
  activityLabel: (id: string, fallback: string) => string;
  menuTag: (category: MenuCategory) => string;
  modeLabel: (mode: string) => string;
}>;

const ko: InterfaceText = {
  brand: "타각",
  typingPractice: "타자 연습",
  menu: "메뉴",
  back: "← 뒤로",
  settings: "환경설정",
  backToMenu: "← 메뉴",
  backToSettings: "← 환경설정",
  start: "시작",
  navigationHint: "선택 · 시작",
  screenCapture: "화면 저장",
  saving: "저장 중…",
  captureDisclosure: "화면 저장을 선택하면 입력 내용도 PNG에 포함됩니다.",
  interfaceLanguage: "인터페이스 언어",
  practiceLanguage: "연습 언어",
  practiceLanguageAfterMenu: "연습 중에는 현재 내용을 유지합니다. 언어 변경은 메뉴로 돌아간 뒤 적용하세요.",
  koreanSpeedUnit: "한국어 속도 단위",
  englishSpeedUnit: "영어 속도 단위",
  speedUnitCpm: (language) => language === "ko" ? "분당 타수 (CPM)" : "분당 글자 수 (CPM)",
  speedUnitWpm: "분당 단어 수 (WPM)",
  speedUnitHelp: "WPM은 분당 타수를 5로 나눈 값입니다.",
  speedLabel: (unit, language) => unit === "wpm" ? "단어/분" : language === "ko" ? "타수/분" : "글자/분",
  speedValue: (value, unit, language) => String(value) + " " + (unit === "wpm" ? "단어/분" : language === "ko" ? "타수/분" : "글자/분"),
  korean: "한국어",
  english: "영어",
  practiceSize: "연습 글자 크기",
  resetSize: "기본 크기로 되돌리기",
  standardSize: "기본",
  largeSize: "크게",
  largestSize: "아주 크게",
  colorTheme: "색상 테마",
  resetTheme: "기본 색상으로 되돌리기",
  terminalTheme: "터미널 야간",
  paperTheme: "종이 밝음",
  practiceFont: "연습 글꼴",
  resetFont: "기본 글꼴로 되돌리기",
  gothicFont: "고딕",
  serifFont: "명조",
  completionSound: "효과음",
  completionSoundHelp: "연습 완료와 베네치아의 입력·정답·피격·종료 때 재생합니다. 기본은 끔입니다.",
  soundOn: "켬",
  soundOff: "끔",
  resetSettings: "환경설정을 기본값으로 되돌리기",
  settingsHelp: "↑/↓로 항목을 이동하고 ←/→ 또는 Enter/Space로 값을 바꾸세요. 초기화 항목은 Enter/Space로 실행합니다. Esc로 이전 화면으로 돌아가며 변경 사항은 이 브라우저에 저장됩니다.",
  saveFailed: "설정을 저장하지 못했습니다. 현재 탭에서만 적용됩니다.",
  invalidSettings: "저장된 환경설정을 읽지 못했습니다. 기본값을 사용하며 기존 값은 보존했습니다.",
  chooseShortPassage: "짧은 글 고르기",
  chooseLongPassage: "긴 글 고르기",
  shortPassage: "짧은 글",
  longPassage: "긴 글",
  choosePractice: "연습 종류 고르기",
  select: "선택",
  firstLast: "처음/끝",
  currentPrompt: "제시문",
  sourceLabel: "출처",
  openSource: (source) => `출처 확인: ${source} (새 탭에서 열림)`,
  originalLineSource: "타각 직접 작성",
  followAlong: "따라 입력하기",
  submit: "제출",
  spaceSubmitHint: "제시문을 모두 입력한 뒤 제출",
  finishPractice: "연습 마치기",
  currentScore: "현재 점수",
  previousSentence: "직전 한 줄",
  previousScore: "직전 점수",
  accuracy: "정확도",
  elapsedTime: "경과 시간",
  result: "결과",
  practiceComplete: "연습 완료",
  thisResult: "이번 결과",
  sameModePrevious: "같은 모드의 이전 기록",
  previousResult: "이전 결과",
  practiceAgain: "다시 연습",
  nextWord: "다음 낱말",
  wordProgress: (index, total) => `${index} / ${total}번째 낱말`,
  lineSessionProgress: (current, total) => `문장 ${current} / ${total}`,
  lineSessionCompleted: (count) => `${count}문장 완료`,
  lineSessionResult: "한 줄 연습 세션",
  lineSessionStatistics: "세션 속도 통계",
  lineSessionSampleCount: (count) => `통계에 포함된 속도 ${count}개`,
  mean: "평균",
  standardDeviation: "표준편차",
  median: "중간값",
  interquartileRange: "IQR",
  returnTo: (destination) => destination === "메뉴" ? "메뉴로 돌아가기" : `${destination}으로 돌아가기`,
  openPractice: "연습으로 돌아가기",
  blockedPracticeInput: "연습 문장은 키보드로 직접 입력하세요.",
  remainingCharacters: (count) => `제시문이 ${count}자 남았습니다.`,
  noRecords: "표시할 연습 기록이 없습니다.",
  practiceKind: "연습 종류",
  all: "전체",
  clearHistory: "기록 지우기",
  confirmClearHistory: "이 브라우저에 저장한 연습 기록을 지울까요?",
  clearAllHistory: "전체 기록 지우기",
  cancel: "취소",
  historySaveFailed: "이번 기록은 저장하지 못했습니다. 앱을 닫기 전까지 볼 수 있습니다.",
  historyClearFailed: "기록을 지우지 못했습니다. 브라우저의 저장 설정을 확인하세요.",
  historyCleared: "최근 연습 기록을 지웠습니다.",
  historyReadFailed: "저장된 기록을 읽을 수 없습니다. 현재 연습은 계속할 수 있습니다.",
  accuracyValue: (value) => `정확도 ${value}%`,
  challengeTitle: "30초 낱말 도전",
  challengeInstruction: "한글 낱말을 그대로 입력하고 Enter를 누르세요. 30초 동안 맞힌 낱말 수를 셉니다.",
  challengeStart: "도전 시작",
  challengeResult: "도전 결과",
  timeEnded: "시간이 끝났습니다.",
  challengeStopped: "도전을 중단했습니다.",
  solvedWords: "맞힌 낱말",
  solvedWordCount: (count) => `${count}개`,
  elapsedTimeValue: (seconds) => `${seconds}초`,
  retryChallenge: "다시 도전",
  remainingTime: (seconds) => `남은 시간 ${seconds}초`,
  enterWord: "낱말은 키보드로 직접 입력하세요.",
  stopChallenge: "중단",
  blockedWordInput: "제시된 낱말과 같은지 확인하세요.",
  retryWord: "낱말 연습",
  veniceTitle: "베네치아",
  veniceInstruction: "낱말을 입력해 탑을 지키세요. 일반 낱말 상단이 빨간 충돌선에 닿으면 탑 블록 1개가 손상됩니다. 노란 특수 낱말을 맞히면 효과가 발동하며, 감염된 레벨에서는 놓친 특수 낱말도 탑에 피해를 줍니다.",
  veniceCollisionLine: "충돌선 · 일반 낱말이 닿으면 탑 -1",
  veniceLevel: "레벨",
  veniceRecommended: (level) => `최근 플레이 기준 ${level}레벨 추천`,
  veniceStart: "게임 시작",
  veniceReadyHint: "↑/↓로 시작 레벨 선택 · 1~9 숫자로 바로 선택 · Enter 시작 · Esc 메뉴",
  veniceTargetCpm: "목표 CPM",
  veniceScore: "점수",
  veniceTower: "탑 블록",
  veniceStageProgress: (spawned, total) => `일반 낱말 ${spawned} / ${total}`,
  veniceEndlessProgress: (spawned) => `최종 점수 구간 · 일반 낱말 ${spawned}개`,
  veniceInputLabel: "보이는 낱말을 입력하세요",
  veniceSubmit: "낱말 확정",
  veniceFinish: "게임 마치기",
  venicePaused: "일시 정지",
  venicePause: "게임 일시 정지",
  veniceResume: "게임 계속",
  veniceMismatch: "보이는 낱말과 일치하는 입력이 없습니다. 고쳐서 다시 확정하세요.",
  veniceEffectLabel: (effect) => ({
    clear: "낱말 싹쓸이",
    freeze: "낙하 정지",
    repair: "탑 재건 +4",
    haste: "낙하 가속",
    slow: "낙하 감속",
    hide: "낱말 숨기기",
    swarm: "낱말 무리 출현",
    mine: "지뢰 설치",
    infection: "감염 차단",
  }[effect] ?? "특수 효과"),
  veniceInfectionActive: "감염 중: 이번 레벨에서 놓친 바이러스도 탑에 피해를 줍니다.",
  veniceResult: "베네치아 결과",
  venicePlayAgain: "같은 레벨로 다시 시작",
  veniceChooseLevel: "다른 레벨 선택",
  veniceStartLevel: "시작 레벨",
  veniceHighestLevel: "최고 레벨",
  veniceTypedWords: "완성한 낱말",
  veniceMissedWords: "놓친 낱말",
  veniceTopScores: "로컬 Top 10 하이스코어",
  veniceRank: "순위",
  veniceDate: "플레이 날짜",
  veniceNoScores: "아직 저장된 점수가 없습니다.",
  veniceSaveFailed: "결과를 저장하지 못했습니다. 이번 결과는 화면에서 확인할 수 있습니다.",
  veniceReadFailed: "저장된 베네치아 기록을 읽지 못했습니다. 기존 값은 보존했습니다.",
  freePractice: "연습장",
  freePracticeLabel: "원하는 내용을 자유롭게 입력하세요",
  freePracticeHint: "Enter 줄바꿈 · Esc 메뉴",
  newline: "줄바꿈",
  positionPractice: "물리 키 위치 연습",
  positionInstruction: "강조된 위치의 키를 누르세요.",
  tryAgain: "다시 시도하세요.",
  nextKey: "다음 키",
  passagePage: (page, total) => `${page} / ${total} 묶음`,
  charactersSuffix: "자",
  passageCurrentLine: "현재 줄",
  passageCompletedLine: "완료한 줄",
  passageNextLine: "다음 줄",
  passageBundleScore: "완료한 묶음",
  genreLabel: (genre) => ({
    literature: "문학",
    nonfiction: "비문학",
    technology: "기술",
    life: "생활",
    subculture: "서브컬쳐",
  }[genre] ?? genre),
  licenseLabel: (license) => ({
    "public-domain": "퍼블릭 도메인",
    "cc-by-sa-4.0": "CC BY-SA 4.0",
  }[license] ?? ""),
  screenCaptureError: "화면을 저장하지 못했습니다. 다시 시도하세요.",
  screenCaptureSuccess: "화면을 PNG로 저장했습니다.",
  screenCaptureUnsupported: "이 브라우저에서는 화면 저장을 지원하지 않습니다.",
  dataTransferTitle: "데이터 백업·가져오기",
  dataTransferDescription: "환경설정, 최근 연습 기록, 베네치아 기록을 로컬 JSON 파일로 옮깁니다. 입력 중인 내용은 포함하지 않습니다.",
  backupExport: "백업 내보내기",
  backupImport: "백업 가져오기",
  backupContents: "JSON 백업에는 환경설정과 저장된 기록만 포함됩니다.",
  backupChooseFile: "백업 JSON 파일",
  backupFormatError: "이 백업 파일은 손상되었거나 지원하지 않는 형식입니다. 기존 데이터는 바꾸지 않았습니다.",
  backupReadError: "백업 파일을 읽지 못했습니다. 파일을 확인하고 다시 시도하세요.",
  backupExportSuccess: "백업 파일을 저장했습니다.",
  backupExportError: "백업 파일을 만들거나 저장하지 못했습니다.",
  backupConflict: "저장된 데이터가 있습니다. 가져오는 기록을 병합하거나 전체 데이터를 교체할 수 있습니다.",
  backupMerge: "병합",
  backupReplace: "전체 교체",
  backupImportSuccess: "백업 데이터를 병합했습니다.",
  backupReplaceSuccess: "저장된 데이터를 백업으로 교체했습니다.",
  backupRestoreError: "데이터를 저장하지 못했습니다. 기존 값은 복원했습니다.",
  backupCurrentDataError: "현재 저장 데이터가 손상되어 병합할 수 없습니다. 전체 교체하거나 취소하세요.",
  activityLabel: (id, fallback) => ({
    // The practice language is already chosen, so menu labels omit it.
    "ko-line": "한 줄",
    "ko-word": "낱말",
    "en-line": "한 줄",
    "en-word": "낱말",
    "ko-positions": "두벌식 자리 연습",
    "short-library": "짧은 글",
    "long-library": "긴 글",
    challenge: "30초 낱말 도전",
    venice: "베네치아",
    "free-practice": "연습장",
    history: "최근 연습 기록",
    settings: "환경설정",
    "data-transfer": "데이터 백업·가져오기",
  }[id] ?? fallback),
  menuTag: (category) => ({ practice: "연습", game: "게임", other: "기타" }[category]),
  modeLabel: (mode) => ({ word: "낱말", line: "한 줄", short: "짧은 글", long: "긴 글", position: "자리" }[mode] ?? mode),
};

const en: InterfaceText = {
  brand: "Tagak",
  typingPractice: "Typing practice",
  menu: "Menu",
  back: "← Back",
  settings: "Settings",
  backToMenu: "← Menu",
  backToSettings: "← Settings",
  start: "Start",
  navigationHint: "Select · Start",
  screenCapture: "Save screen",
  saving: "Saving…",
  captureDisclosure: "Saving the screen includes the visible text in the PNG.",
  interfaceLanguage: "Interface language",
  practiceLanguage: "Practice language",
  practiceLanguageAfterMenu: "The current practice stays open. Return to the menu to change the practice language.",
  koreanSpeedUnit: "Korean speed unit",
  englishSpeedUnit: "English speed unit",
  speedUnitCpm: (language) => language === "ko" ? "Keystrokes/minute (CPM)" : "Characters/minute (CPM)",
  speedUnitWpm: "Words/minute (WPM)",
  speedUnitHelp: "WPM is calculated by dividing CPM by five.",
  speedLabel: (unit, language) => unit === "wpm" ? "Words/min" : language === "ko" ? "Keystrokes/min" : "Characters/min",
  speedValue: (value, unit, language) => String(value) + " " + (unit === "wpm" ? "words/min" : language === "ko" ? "keystrokes/min" : "characters/min"),
  korean: "Korean",
  english: "English",
  practiceSize: "Practice text size",
  resetSize: "Reset text size",
  standardSize: "Standard",
  largeSize: "Large",
  largestSize: "Largest",
  colorTheme: "Color theme",
  resetTheme: "Reset color theme",
  terminalTheme: "Terminal night",
  paperTheme: "Paper light",
  practiceFont: "Practice font",
  resetFont: "Reset practice font",
  gothicFont: "Sans-serif",
  serifFont: "Serif",
  completionSound: "Sound effects",
  completionSoundHelp: "Plays for completed practice items and Venice typing, hits, damage, and game over. Off by default.",
  soundOn: "On",
  soundOff: "Off",
  resetSettings: "Reset settings to defaults",
  settingsHelp: "Use Up/Down to move between settings and Left/Right or Enter/Space to change a value. Enter/Space runs reset actions. Press Escape to return. Changes are saved in this browser.",
  saveFailed: "Settings could not be saved. Changes apply only in this tab.",
  invalidSettings: "Saved settings could not be read. Defaults are in use; the stored value was preserved.",
  chooseShortPassage: "Choose a short passage",
  chooseLongPassage: "Choose a long passage",
  shortPassage: "Short passages",
  longPassage: "Long passages",
  choosePractice: "Choose practice",
  select: "Select",
  firstLast: "First/Last",
  currentPrompt: "Prompt",
  sourceLabel: "Source",
  openSource: (source) => `Open source: ${source} (opens in a new tab)`,
  originalLineSource: "Written for Tagak",
  followAlong: "Type the prompt",
  submit: "Submit",
  spaceSubmitHint: "Submit after completing the prompt",
  finishPractice: "Finish practice",
  currentScore: "Current score",
  previousSentence: "Previous line",
  previousScore: "Previous score",
  accuracy: "Accuracy",
  elapsedTime: "Elapsed time",
  result: "Result",
  practiceComplete: "Practice complete",
  thisResult: "This result",
  sameModePrevious: "Previous result in this mode",
  previousResult: "Previous result",
  practiceAgain: "Practice again",
  nextWord: "Next word",
  wordProgress: (index, total) => `Word ${index} of ${total}`,
  lineSessionProgress: (current, total) => `Sentence ${current} of ${total}`,
  lineSessionCompleted: (count) => `${count} sentences completed`,
  lineSessionResult: "One-line practice session",
  lineSessionStatistics: "Session speed statistics",
  lineSessionSampleCount: (count) => `${count} speed samples included`,
  mean: "Mean",
  standardDeviation: "Standard deviation",
  median: "Median",
  interquartileRange: "IQR",
  returnTo: (destination) => `Return to ${destination}`,
  openPractice: "Return to practice",
  blockedPracticeInput: "Type the prompt with your keyboard.",
  remainingCharacters: (count) => `${count} characters remain in the prompt.`,
  noRecords: "There are no practice records to show.",
  practiceKind: "Practice type",
  all: "All",
  clearHistory: "Clear history",
  confirmClearHistory: "Clear the practice records saved in this browser?",
  clearAllHistory: "Clear all records",
  cancel: "Cancel",
  historySaveFailed: "This result could not be saved. It remains available until you close the app.",
  historyClearFailed: "Could not clear records. Check this browser's storage settings.",
  historyCleared: "Recent practice records were cleared.",
  historyReadFailed: "Saved records could not be read. You can continue practicing.",
  accuracyValue: (value) => `Accuracy ${value}%`,
  challengeTitle: "30-second word challenge",
  challengeInstruction: "Type each Korean word and press Enter. Count how many you solve in 30 seconds.",
  challengeStart: "Start challenge",
  challengeResult: "Challenge result",
  timeEnded: "Time is up.",
  challengeStopped: "The challenge was stopped.",
  solvedWords: "Words solved",
  solvedWordCount: (count) => `${count} words`,
  elapsedTimeValue: (seconds) => `${seconds} sec`,
  retryChallenge: "Try again",
  remainingTime: (seconds) => `${seconds} sec remaining`,
  enterWord: "Type the word with your keyboard.",
  stopChallenge: "Stop",
  blockedWordInput: "Check that the prompt and your input match.",
  retryWord: "Word practice",
  veniceTitle: "Venice",
  veniceInstruction: "Type words to defend the tower. When the top of a regular word reaches the red line, one tower block is damaged. Hitting a yellow special word triggers its effect; while infected, missed special words also damage the tower.",
  veniceCollisionLine: "Impact line · missed regular word: −1 block",
  veniceLevel: "Level",
  veniceRecommended: (level) => `Level ${level} recommended from recent runs`,
  veniceStart: "Start game",
  veniceReadyHint: "Use ↑/↓ to choose a start level · press 1–9 to jump · Enter to start · Esc for menu",
  veniceTargetCpm: "Target CPM",
  veniceScore: "Score",
  veniceTower: "Tower blocks",
  veniceStageProgress: (spawned, total) => `Regular words ${spawned} / ${total}`,
  veniceEndlessProgress: (spawned) => `Endless score run · ${spawned} regular words`,
  veniceInputLabel: "Type a visible word",
  veniceSubmit: "Submit word",
  veniceFinish: "Finish game",
  venicePaused: "Paused",
  venicePause: "Pause",
  veniceResume: "Resume game",
  veniceMismatch: "No visible word matches this input. Edit it and submit again.",
  veniceEffectLabel: (effect) => ({
    clear: "Clear falling words",
    freeze: "Freeze falling words",
    repair: "Repair tower +4",
    haste: "Speed up falling words",
    slow: "Slow falling words",
    hide: "Hide words briefly",
    swarm: "Spawn a word swarm",
    mine: "Place a mine",
    infection: "Block infection",
  }[effect] ?? "Special effect"),
  veniceInfectionActive: "Infected: missed viruses damage the tower until this level ends.",
  veniceResult: "Venice result",
  venicePlayAgain: "Play again at this level",
  veniceChooseLevel: "Choose another level",
  veniceStartLevel: "Start level",
  veniceHighestLevel: "Highest level",
  veniceTypedWords: "Words completed",
  veniceMissedWords: "Words missed",
  veniceTopScores: "Local Top 10 scores",
  veniceRank: "Rank",
  veniceDate: "Played",
  veniceNoScores: "There are no saved scores yet.",
  veniceSaveFailed: "The result could not be saved. It remains visible here.",
  veniceReadFailed: "Saved Venice records could not be read. The existing value was preserved.",
  freePractice: "Free typing",
  freePracticeLabel: "Type anything you like",
  freePracticeHint: "Enter for a new line · Esc for menu",
  newline: "New line",
  positionPractice: "Physical key position practice",
  positionInstruction: "Press the highlighted key.",
  tryAgain: "Try again.",
  nextKey: "Next key",
  passagePage: (page, total) => `Page ${page} / ${total}`,
  charactersSuffix: " characters",
  passageCurrentLine: "Current line",
  passageCompletedLine: "Completed line",
  passageNextLine: "Next line",
  passageBundleScore: "Completed bundle",
  genreLabel: (genre) => ({
    literature: "Literature",
    nonfiction: "Nonfiction",
    technology: "Technology",
    life: "Life",
    subculture: "Subculture",
  }[genre] ?? genre),
  licenseLabel: (license) => ({
    "public-domain": "Public domain",
    "cc-by-sa-4.0": "CC BY-SA 4.0",
  }[license] ?? ""),
  screenCaptureError: "Could not save the screen. Try again.",
  screenCaptureSuccess: "Saved the screen as a PNG.",
  screenCaptureUnsupported: "Screen capture is not supported in this browser.",
  dataTransferTitle: "Back up and restore data",
  dataTransferDescription: "Move settings, recent practice records, and Venice records in a local JSON file. Text currently being typed is never included.",
  backupExport: "Export backup",
  backupImport: "Import backup",
  backupContents: "The JSON backup includes saved settings and records only.",
  backupChooseFile: "Backup JSON file",
  backupFormatError: "This backup is damaged or uses an unsupported format. Existing data was not changed.",
  backupReadError: "Could not read the backup file. Check the file and try again.",
  backupExportSuccess: "Saved the backup file.",
  backupExportError: "Could not create or save the backup file.",
  backupConflict: "Saved data already exists. You can merge the imported records or replace all saved data.",
  backupMerge: "Merge",
  backupReplace: "Replace all",
  backupImportSuccess: "Merged the backup data.",
  backupReplaceSuccess: "Replaced saved data with the backup.",
  backupRestoreError: "Could not save the data. The previous values were restored.",
  backupCurrentDataError: "Current saved data is damaged and cannot be merged. Replace all data or cancel.",
  activityLabel: (id, fallback) => ({
    // The practice language is already chosen, so menu labels omit it.
    "ko-line": "One-line drills",
    "ko-word": "Words",
    "en-line": "One-line drills",
    "en-word": "Words",
    "ko-positions": "Two-set keyboard positions",
    "short-library": "Short passages",
    "long-library": "Long passages",
    challenge: "30-second word challenge",
    venice: "Venice",
    "free-practice": "Free typing",
    history: "Recent practice",
    settings: "Settings",
    "data-transfer": "Back up and restore data",
  }[id] ?? fallback),
  menuTag: (category) => ({ practice: "Practice", game: "Game", other: "Other" }[category]),
  modeLabel: (mode) => ({ word: "Words", line: "One line", short: "Short passages", long: "Long passages", position: "Positions" }[mode] ?? mode),
};

export function interfaceText(language: Language): InterfaceText {
  return language === "en" ? en : ko;
}
