import { describe, expect, it } from "vitest";
import {
  decodeAppPreferences,
  defaultAppPreferences,
} from "./appPreferences";

describe("app preferences", () => {
  it("uses twenty lines as the default session length", () => {
    expect(defaultAppPreferences.linePracticeSessionLength).toBe(20);
    expect(decodeAppPreferences(null)).toEqual({ value: defaultAppPreferences, valid: true });
  });

  it("migrates older preference versions with the default line count", () => {
    const v1 = decodeAppPreferences(JSON.stringify({
      version: 1,
      preferences: { interfaceLanguage: "en", practiceLanguage: "ko", completionSound: true },
    }));
    const v2 = decodeAppPreferences(JSON.stringify({
      version: 2,
      preferences: {
        interfaceLanguage: "en",
        practiceLanguage: "ko",
        completionSound: true,
        typingSpeedUnits: { ko: "wpm", en: "cpm" },
      },
    }));

    expect(v1).toMatchObject({ valid: true, value: { linePracticeSessionLength: 20 } });
    expect(v2).toMatchObject({ valid: true, value: { linePracticeSessionLength: 20 } });
    expect(v2.value.typingSpeedUnits).toEqual({ ko: "wpm", en: "cpm" });
  });

  it("reads supported line counts and rejects values outside the setting choices", () => {
    const current = decodeAppPreferences(JSON.stringify({
      version: 3,
      preferences: { ...defaultAppPreferences, linePracticeSessionLength: 75 },
    }));
    const invalid = decodeAppPreferences(JSON.stringify({
      version: 3,
      preferences: { ...defaultAppPreferences, linePracticeSessionLength: 25 },
    }));

    expect(current).toMatchObject({ valid: true, value: { linePracticeSessionLength: 75 } });
    expect(invalid).toEqual({ value: defaultAppPreferences, valid: false });
  });
});
