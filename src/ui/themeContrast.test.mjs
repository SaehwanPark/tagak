import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { colorThemes, defaultColorTheme } from "../storage/settingsStorage";

const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const baseRule = styles.match(/:root\s*\{([^}]*)\}/)?.[1] ?? "";
const backgrounds = ["--page", "--shell", "--panel", "--field", "--hover"];
const foregrounds = ["--ink", "--ink-strong", "--quiet", "--accent", "--correct", "--wrong"];
const requiredTokens = [
  "--page", "--shell", "--ink", "--ink-strong", "--accent", "--accent-hover", "--accent-ink", "--quiet",
  "--line", "--panel", "--field", "--field-border", "--hover", "--correct", "--wrong", "--shadow",
];

function declarations(block) {
  return Object.fromEntries(
    Array.from(block.matchAll(/(--[\w-]+):\s*(#[a-f\d]{6}(?:[a-f\d]{2})?);/gi), ([, token, color]) => [token, color]),
  );
}

function paletteFor(theme) {
  const themeRules = theme === "terminal"
    ? []
    : Array.from(styles.matchAll(new RegExp(`:root\\[data-color-theme="${theme}"\\]\\s*\\{([^}]*)\\}`, "g")));
  const overrides = themeRules.reduce(
    (tokens, rule) => ({ ...tokens, ...declarations(rule[1] ?? "") }),
    {},
  );
  return { ...declarations(baseRule), ...overrides };
}

function luminance(hex) {
  const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset + 1, offset + 3), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("color theme palettes", () => {
  it("contains ten dark and four light themes while retaining the original IDs", () => {
    const themes = Object.keys(colorThemes);
    const lightThemes = new Set(["paper", "solarized-light", "catppuccin-latte", "nord-light"]);
    expect(themes.filter((theme) => !lightThemes.has(theme))).toEqual([
      "terminal", "amber-terminal", "catppuccin-mocha", "tokyo-night", "nord", "gruvbox-dark", "dracula",
      "rose-pine", "slate-mint", "phosphor-green",
    ]);
    expect(themes.filter((theme) => lightThemes.has(theme))).toEqual([
      "paper", "solarized-light", "catppuccin-latte", "nord-light",
    ]);
    expect(defaultColorTheme).toBe("terminal");
    expect(colorThemes.terminal).toEqual({ ko: "터미널 야간", en: "Terminal night" });
    expect(colorThemes.paper).toEqual({ ko: "종이 밝음", en: "Paper light" });
  });

  it.each(Object.keys(colorThemes))("defines complete, readable tokens for %s", (theme) => {
    const palette = paletteFor(theme);
    for (const token of requiredTokens) expect(palette[token], `${theme} ${token}`).toMatch(/^#[a-f\d]{6,8}$/i);

    for (const foreground of foregrounds) {
      for (const background of backgrounds) {
        expect(
          contrast(palette[foreground], palette[background]),
          `${theme}: ${foreground} on ${background}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }

    expect(contrast(palette["--accent-ink"], palette["--accent"]), `${theme}: button label on accent`)
      .toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette["--accent-ink"], palette["--accent-hover"]), `${theme}: button label on hover`)
      .toBeGreaterThanOrEqual(4.5);
    expect(contrast(palette["--field-border"], palette["--field"]), `${theme}: field border`)
      .toBeGreaterThanOrEqual(3);

    if (theme !== "terminal" && theme !== "paper") {
      for (const background of backgrounds) {
        expect(contrast(palette["--line"], palette[background]), `${theme}: separator on ${background}`)
          .toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("uses a light native color scheme for the four light palettes", () => {
    for (const theme of ["paper", "solarized-light", "catppuccin-latte", "nord-light"]) {
      expect(styles).toMatch(new RegExp(`:root\\[data-color-theme="${theme}"\\][^{]*\\{\\s*color-scheme:\\s*light;`));
    }
    expect(styles).toMatch(/:root\s*\{\s*color-scheme:\s*dark;/);
  });

  it("keeps typing correctness and focus distinguishable beyond color alone", () => {
    expect(styles).toMatch(/\.target \.current\s*\{[^}]*background:\s*var\(--hover\);/);
    expect(styles).toMatch(/\.target \.correct\s*\{[^}]*text-decoration:\s*underline;/);
    expect(styles).toMatch(/\.target \.wrong\s*\{[^}]*text-decoration:\s*underline wavy;/);
    expect(styles).toMatch(/:focus-visible\s*\{\s*outline:\s*2px solid var\(--accent\)/);
    expect(styles).toMatch(/\.high-score-status\s*\{[^}]*color:\s*var\(--accent\)/);
  });
});
