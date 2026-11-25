import type { Language } from "../content/lessons";
import {
  defaultTypingSpeedUnits,
  isTypingSpeedUnit,
} from "../domain/typingSpeed";
import type { TypingSpeedUnits } from "../domain/typingSpeed";
import {
  defaultLinePracticeSessionLength,
  isLinePracticeSessionLength,
} from "../domain/linePracticeSettings";
import type { LinePracticeSessionLength } from "../domain/linePracticeSettings";
import {
  ensureStorageMigrated,
  migrateStorageValue,
  readStorageValue,
  resetStorageValue,
  storageKeys,
  withStorageEntryLock,
} from "./legacyStorage";

export const appPreferencesKey = storageKeys.preferences;

export type AppPreferences = Readonly<{
  interfaceLanguage: Language;
  practiceLanguage: Language;
  completionSound: boolean;
  typingSpeedUnits: TypingSpeedUnits;
  linePracticeSessionLength: LinePracticeSessionLength;
}>;

type LegacyAppPreferences = Readonly<{
  interfaceLanguage: Language;
  practiceLanguage: Language;
  completionSound: boolean;
}>;

export const defaultAppPreferences: AppPreferences = {
  interfaceLanguage: "ko",
  practiceLanguage: "ko",
  completionSound: false,
  typingSpeedUnits: defaultTypingSpeedUnits,
  linePracticeSessionLength: defaultLinePracticeSessionLength,
};

export type AppPreferencesRead = Readonly<{ value: AppPreferences; valid: boolean }>;

function isLanguage(value: unknown): value is Language {
  return value === "ko" || value === "en";
}

function isLegacyAppPreferences(value: unknown): value is LegacyAppPreferences {
  return typeof value === "object" && value !== null &&
    "interfaceLanguage" in value && isLanguage(value.interfaceLanguage) &&
    "practiceLanguage" in value && isLanguage(value.practiceLanguage) &&
    "completionSound" in value && typeof value.completionSound === "boolean";
}

function isAppPreferences(value: unknown): value is AppPreferences {
  return isLegacyAppPreferences(value) &&
    "typingSpeedUnits" in value && typeof value.typingSpeedUnits === "object" &&
    value.typingSpeedUnits !== null &&
    "ko" in value.typingSpeedUnits && isTypingSpeedUnit(value.typingSpeedUnits.ko) &&
    "en" in value.typingSpeedUnits && isTypingSpeedUnit(value.typingSpeedUnits.en) &&
    "linePracticeSessionLength" in value && isLinePracticeSessionLength(value.linePracticeSessionLength);
}

function isVersionTwoAppPreferences(value: unknown): value is LegacyAppPreferences & {
  typingSpeedUnits: TypingSpeedUnits;
} {
  return isLegacyAppPreferences(value) &&
    "typingSpeedUnits" in value && typeof value.typingSpeedUnits === "object" &&
    value.typingSpeedUnits !== null &&
    "ko" in value.typingSpeedUnits && isTypingSpeedUnit(value.typingSpeedUnits.ko) &&
    "en" in value.typingSpeedUnits && isTypingSpeedUnit(value.typingSpeedUnits.en);
}

export function decodeAppPreferences(raw: string | null): AppPreferencesRead {
  if (raw === null) return { value: defaultAppPreferences, valid: true };
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value) || !("preferences" in value)) {
      return { value: defaultAppPreferences, valid: false };
    }
    if (value.version === 1 && isLegacyAppPreferences(value.preferences)) {
      return {
        value: {
          ...value.preferences,
          typingSpeedUnits: defaultTypingSpeedUnits,
          linePracticeSessionLength: defaultLinePracticeSessionLength,
        },
        valid: true,
      };
    }
    if (value.version === 2 && isVersionTwoAppPreferences(value.preferences)) {
      return {
        value: {
          ...value.preferences,
          linePracticeSessionLength: defaultLinePracticeSessionLength,
        },
        valid: true,
      };
    }
    if (value.version === 3 && isAppPreferences(value.preferences)) {
      return { value: value.preferences, valid: true };
    }
    return { value: defaultAppPreferences, valid: false };
  } catch {
    return { value: defaultAppPreferences, valid: false };
  }
}

export function readAppPreferences(): AppPreferencesRead {
  try {
    return decodeAppPreferences(readStorageValue("preferences"));
  } catch {
    return { value: defaultAppPreferences, valid: false };
  }
}

function isValidAppPreferences(raw: string): boolean {
  return decodeAppPreferences(raw).valid;
}

export function migrateAppPreferences(): Promise<boolean> {
  return ensureStorageMigrated("preferences", isValidAppPreferences);
}

export async function saveAppPreferences(
  preferences: AppPreferences,
  reset = false,
): Promise<boolean> {
  try {
    return await withStorageEntryLock("preferences", () => {
      if (reset) {
        return resetStorageValue("preferences");
      }
      if (!migrateStorageValue("preferences", isValidAppPreferences)) return false;
      if (!readAppPreferences().valid) return false;
      localStorage.setItem(appPreferencesKey, JSON.stringify({ version: 3, preferences }));
      return true;
    });
  } catch {
    return false;
  }
}
