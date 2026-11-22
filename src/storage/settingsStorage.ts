import type { Language } from "../content/lessons";
import {
  ensureStorageMigrated,
  migrateStorageValue,
  readStorageValue,
  resetStorageValue,
  storageKeys,
  withStorageEntryLock,
} from "./legacyStorage";

export const settingsKey = storageKeys.display;
export const colorThemeKey = storageKeys.colorTheme;
export const practiceFontKey = storageKeys.practiceFont;
export const textSizes = {
  standard: "기본",
  large: "크게",
  largest: "아주 크게",
} as const;

export type TextSize = keyof typeof textSizes;
export const defaultSize: TextSize = "standard";

export const colorThemes = {
  terminal: "터미널 야간",
  paper: "종이 밝음",
} as const;

export type ColorTheme = keyof typeof colorThemes;
export const defaultColorTheme: ColorTheme = "terminal";

export const practiceFonts = {
  gothic: "고딕",
  serif: "명조",
} as const;

export type PracticeFont = keyof typeof practiceFonts;
export const defaultPracticeFont: PracticeFont = "gothic";
export type PracticeFonts = Readonly<Record<Language, PracticeFont>>;
export const defaultPracticeFonts: PracticeFonts = { ko: defaultPracticeFont, en: defaultPracticeFont };

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === "string" && Object.hasOwn(textSizes, value);
}

export function isColorTheme(value: unknown): value is ColorTheme {
  return typeof value === "string" && Object.hasOwn(colorThemes, value);
}

export function isPracticeFont(value: unknown): value is PracticeFont {
  return typeof value === "string" && Object.hasOwn(practiceFonts, value);
}

export function decodeTextSize(raw: string | null): TextSize | null {
  if (raw === null) return defaultSize;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value) ||
        value.version !== 1 || !("size" in value) || !isTextSize(value.size)) {
      return null;
    }
    return value.size;
  } catch {
    return null;
  }
}

export function readTextSize(): TextSize | null {
  try {
    return decodeTextSize(readStorageValue("display"));
  } catch {
    return null;
  }
}

export function migrateTextSize(): Promise<boolean> {
  return ensureStorageMigrated("display", (raw) => decodeTextSize(raw) !== null);
}

export async function saveTextSize(size: TextSize, reset: boolean): Promise<boolean> {
  try {
    return await withStorageEntryLock("display", () => {
      if (reset) {
        return resetStorageValue("display");
      }
      if (!migrateStorageValue("display", (raw) => decodeTextSize(raw) !== null)) return false;
      if (readTextSize() === null) return false;

      localStorage.setItem(settingsKey, JSON.stringify({ version: 1, size }));
      return true;
    });
  } catch {
    return false;
  }
}

export function decodeColorTheme(raw: string | null): ColorTheme | null {
  if (raw === null) return defaultColorTheme;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value) ||
        value.version !== 1 || !("theme" in value) || !isColorTheme(value.theme)) {
      return null;
    }
    return value.theme;
  } catch {
    return null;
  }
}

export function readColorTheme(): ColorTheme | null {
  try {
    return decodeColorTheme(readStorageValue("colorTheme"));
  } catch {
    return null;
  }
}

export function migrateColorTheme(): Promise<boolean> {
  return ensureStorageMigrated("colorTheme", (raw) => decodeColorTheme(raw) !== null);
}

export async function saveColorTheme(theme: ColorTheme, reset: boolean): Promise<boolean> {
  try {
    return await withStorageEntryLock("colorTheme", () => {
      if (reset) {
        return resetStorageValue("colorTheme");
      }
      if (!migrateStorageValue("colorTheme", (raw) => decodeColorTheme(raw) !== null)) return false;
      if (readColorTheme() === null) return false;

      localStorage.setItem(colorThemeKey, JSON.stringify({ version: 1, theme }));
      return true;
    });
  } catch {
    return false;
  }
}

export function decodePracticeFonts(raw: string | null): PracticeFonts | null {
  if (raw === null) return defaultPracticeFonts;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value)) {
      return null;
    }
    if (value.version === 1 && "font" in value && isPracticeFont(value.font)) {
      return { ko: value.font, en: value.font };
    }
    if (value.version === 2 && "fonts" in value && typeof value.fonts === "object" && value.fonts !== null &&
        "ko" in value.fonts && isPracticeFont(value.fonts.ko) &&
        "en" in value.fonts && isPracticeFont(value.fonts.en)) {
      return { ko: value.fonts.ko, en: value.fonts.en };
    }
    return null;
  } catch {
    return null;
  }
}

export function readPracticeFonts(): PracticeFonts | null {
  try {
    return decodePracticeFonts(readStorageValue("practiceFont"));
  } catch {
    return null;
  }
}

export function migratePracticeFonts(): Promise<boolean> {
  return ensureStorageMigrated("practiceFont", (raw) => decodePracticeFonts(raw) !== null);
}

export function readPracticeFont(language: Language = "ko"): PracticeFont | null {
  return readPracticeFonts()?.[language] ?? null;
}

export async function savePracticeFont(
  font: PracticeFont,
  reset: boolean,
  language: Language = "ko",
): Promise<boolean> {
  try {
    return await withStorageEntryLock("practiceFont", () => {
      if (!migrateStorageValue("practiceFont", (raw) => decodePracticeFonts(raw) !== null)) return false;
      const current = readPracticeFonts();
      if (reset && current === null) return resetStorageValue("practiceFont");
      if (current === null) return false;
      const fonts = { ...current, [language]: reset ? defaultPracticeFont : font };
      if (fonts.ko === defaultPracticeFont && fonts.en === defaultPracticeFont) {
        return resetStorageValue("practiceFont");
      }
      localStorage.setItem(practiceFontKey, JSON.stringify({ version: 2, fonts }));
      return true;
    });
  } catch {
    return false;
  }
}

export async function resetPracticeFonts(): Promise<boolean> {
  try {
    return await withStorageEntryLock("practiceFont", () => resetStorageValue("practiceFont"));
  } catch {
    return false;
  }
}
