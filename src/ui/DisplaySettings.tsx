import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  defaultColorTheme,
  defaultPracticeFont,
  defaultSize,
} from "../storage/settingsStorage";
import type { ColorTheme, PracticeFont, TextSize } from "../storage/settingsStorage";
import type { AppPreferences } from "../storage/appPreferences";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import type { TypingSpeedUnit, TypingSpeedUnits } from "../domain/typingSpeed";
import { focusWithinScrollRegion } from "./focusWithinScrollRegion";

type DisplaySettingsProps = {
  interfaceLanguage: Language;
  practiceLanguage: Language;
  onInterfaceLanguageChange: (language: Language) => void;
  onPracticeLanguageChange: (language: Language) => void;
  typingSpeedUnits: TypingSpeedUnits;
  onTypingSpeedUnitChange: (language: Language, unit: TypingSpeedUnit) => void;
  size: TextSize;
  onSizeChange: (size: TextSize, reset?: boolean) => Promise<void>;
  theme: ColorTheme;
  onThemeChange: (theme: ColorTheme, reset?: boolean) => Promise<void>;
  font: PracticeFont;
  onFontChange: (font: PracticeFont, reset?: boolean) => Promise<void>;
  completionSound: AppPreferences["completionSound"];
  onCompletionSoundChange: (enabled: boolean) => void;
  onOpenHistory: () => void;
  onOpenDataTransfer: () => void;
  onReset: () => void;
  onBack: () => void;
  backLabel: string;
  practiceLanguageLocked: boolean;
  initialFocusRow: string;
  notice: string;
  copy: InterfaceText;
};

type SettingOption<Value extends string> = { value: Value; label: string };

type SettingRowProps = {
  id: string;
  label: string;
  active: boolean;
  onFocus: () => void;
  disabled?: boolean;
  help?: string;
};

type ChoiceRowProps<Value extends string> = SettingRowProps & {
  value: Value;
  options: readonly SettingOption<Value>[];
  onChange: (value: Value) => void;
};

function cycleOption<Value extends string>(
  value: Value,
  options: readonly SettingOption<Value>[],
  direction: -1 | 1,
): Value {
  const currentIndex = options.findIndex((option) => option.value === value);
  const nextIndex = (currentIndex + direction + options.length) % options.length;
  return options[nextIndex]?.value ?? value;
}

function ChoiceRow<Value extends string>({
  id, label, active, value, options, onChange, onFocus, disabled = false, help,
}: ChoiceRowProps<Value>) {
  const current = options.find((option) => option.value === value);
  const helpId = help ? `${id}-help` : undefined;
  const className = `setting-row${active ? " selected" : ""}`;
  return (
    <div className="setting-row-wrap">
      <button
        type="button"
        className={className}
        data-setting-row={id}
        tabIndex={active ? 0 : -1}
        aria-describedby={helpId}
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space"
        disabled={disabled}
        onFocus={onFocus}
        onClick={() => onChange(cycleOption(value, options, 1))}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            onChange(cycleOption(value, options, event.key === "ArrowRight" ? 1 : -1));
          }
        }}
      >
        <span className="setting-row-label">{label}</span>
        <span className="setting-row-value">{current?.label ?? value}</span>
      </button>
      {help && <small className="setting-row-help" id={helpId}>{help}</small>}
    </div>
  );
}

function ActionRow({ id, label, active, onFocus, onClick }: SettingRowProps & { onClick: () => void }) {
  return (
    <div className="setting-row-wrap">
      <button
        type="button"
        className={`setting-row setting-action${active ? " selected" : ""}`}
        data-setting-row={id}
        tabIndex={active ? 0 : -1}
        aria-keyshortcuts="ArrowUp ArrowDown Enter Space"
        onFocus={onFocus}
        onClick={onClick}
      >
        <span className="setting-row-label">{label}</span>
        <span className="setting-row-value" aria-hidden="true">↵</span>
      </button>
    </div>
  );
}

export function DisplaySettings({
  interfaceLanguage,
  practiceLanguage,
  onInterfaceLanguageChange,
  onPracticeLanguageChange,
  typingSpeedUnits,
  onTypingSpeedUnitChange,
  size,
  onSizeChange,
  theme,
  onThemeChange,
  font,
  onFontChange,
  completionSound,
  onCompletionSoundChange,
  onOpenHistory,
  onOpenDataTransfer,
  onReset,
  onBack,
  backLabel,
  practiceLanguageLocked,
  initialFocusRow,
  notice,
  copy,
}: DisplaySettingsProps) {
  const menu = useRef<HTMLDivElement>(null);
  const [focusedRow, setFocusedRow] = useState("interface-language");
  const labels = Array.from(new Set(notice.split(" ").filter(Boolean))).map((code) =>
    code === "invalid" ? copy.invalidSettings : code === "save-failed" ? copy.saveFailed : ""
  ).filter(Boolean);

  useEffect(() => {
    const rows = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("[data-setting-row]:not(:disabled)") ?? []);
    const target = rows.find((row) => row.dataset.settingRow === initialFocusRow) ?? rows[0];
    if (target) {
      setFocusedRow(target.dataset.settingRow ?? "interface-language");
      focusWithinScrollRegion(target);
    }
  }, [initialFocusRow]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && !event.nativeEvent.isComposing) {
      onBack();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;

    const rows = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>("[data-setting-row]:not(:disabled)") ?? []);
    const currentIndex = rows.findIndex((row) => row === event.target);
    if (currentIndex < 0 || rows.length === 0) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + rows.length) % rows.length;
    if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % rows.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = rows.length - 1;
    const next = rows[nextIndex];
    if (next) {
      setFocusedRow(next.dataset.settingRow ?? "interface-language");
      focusWithinScrollRegion(next);
    }
  }

  return (
    <section className="screen settings-screen" onKeyDown={handleKeyDown}>
      <button className="back" type="button" onClick={onBack}>{backLabel}</button>
      <h1 tabIndex={-1}>{copy.settings}</h1>
      <p className="lede">{copy.settingsHelp}</p>
      <div ref={menu} className="settings-panel settings-page settings-menu" role="group" aria-label={copy.settings} data-scroll-region>
        <ChoiceRow<Language>
          id="interface-language"
          label={copy.interfaceLanguage}
          active={focusedRow === "interface-language"}
          value={interfaceLanguage}
          options={[
            { value: "ko", label: copy.korean },
            { value: "en", label: copy.english },
          ]}
          onChange={onInterfaceLanguageChange}
          onFocus={() => setFocusedRow("interface-language")}
        />
        <ChoiceRow<Language>
          id="practice-language"
          label={copy.practiceLanguage}
          active={focusedRow === "practice-language"}
          value={practiceLanguage}
          options={[
            { value: "ko", label: copy.korean },
            { value: "en", label: copy.english },
          ]}
          onChange={onPracticeLanguageChange}
          onFocus={() => setFocusedRow("practice-language")}
          disabled={practiceLanguageLocked}
          {...(practiceLanguageLocked ? { help: copy.practiceLanguageAfterMenu } : {})}
        />
        <ChoiceRow<TypingSpeedUnit>
          id="korean-speed-unit"
          label={copy.koreanSpeedUnit}
          active={focusedRow === "korean-speed-unit"}
          value={typingSpeedUnits.ko}
          options={[
            { value: "cpm", label: copy.speedUnitCpm("ko") },
            { value: "wpm", label: copy.speedUnitWpm },
          ]}
          onChange={(value) => onTypingSpeedUnitChange("ko", value)}
          onFocus={() => setFocusedRow("korean-speed-unit")}
        />
        <ChoiceRow<TypingSpeedUnit>
          id="english-speed-unit"
          label={copy.englishSpeedUnit}
          active={focusedRow === "english-speed-unit"}
          value={typingSpeedUnits.en}
          options={[
            { value: "cpm", label: copy.speedUnitCpm("en") },
            { value: "wpm", label: copy.speedUnitWpm },
          ]}
          onChange={(value) => onTypingSpeedUnitChange("en", value)}
          onFocus={() => setFocusedRow("english-speed-unit")}
          help={copy.speedUnitHelp}
        />
        <ChoiceRow<TextSize>
          id="practice-size"
          label={copy.practiceSize}
          active={focusedRow === "practice-size"}
          value={size}
          options={[
            { value: "standard", label: copy.standardSize },
            { value: "large", label: copy.largeSize },
            { value: "largest", label: copy.largestSize },
          ]}
          onChange={(value) => { void onSizeChange(value); }}
          onFocus={() => setFocusedRow("practice-size")}
        />
        <ActionRow
          id="reset-size"
          label={copy.resetSize}
          active={focusedRow === "reset-size"}
          onFocus={() => setFocusedRow("reset-size")}
          onClick={() => void onSizeChange(defaultSize, true)}
        />
        <ChoiceRow<ColorTheme>
          id="color-theme"
          label={copy.colorTheme}
          active={focusedRow === "color-theme"}
          value={theme}
          options={[
            { value: "terminal", label: copy.terminalTheme },
            { value: "paper", label: copy.paperTheme },
          ]}
          onChange={(value) => { void onThemeChange(value); }}
          onFocus={() => setFocusedRow("color-theme")}
        />
        <ActionRow
          id="reset-theme"
          label={copy.resetTheme}
          active={focusedRow === "reset-theme"}
          onFocus={() => setFocusedRow("reset-theme")}
          onClick={() => void onThemeChange(defaultColorTheme, true)}
        />
        <ChoiceRow<PracticeFont>
          id="practice-font"
          label={`${copy.practiceFont} · ${practiceLanguage === "ko" ? copy.korean : copy.english}`}
          active={focusedRow === "practice-font"}
          value={font}
          options={[
            { value: "gothic", label: copy.gothicFont },
            { value: "serif", label: copy.serifFont },
          ]}
          onChange={(value) => { void onFontChange(value); }}
          onFocus={() => setFocusedRow("practice-font")}
        />
        <ActionRow
          id="reset-font"
          label={copy.resetFont}
          active={focusedRow === "reset-font"}
          onFocus={() => setFocusedRow("reset-font")}
          onClick={() => void onFontChange(defaultPracticeFont, true)}
        />
        <ChoiceRow<"on" | "off">
          id="completion-sound"
          label={copy.completionSound}
          active={focusedRow === "completion-sound"}
          value={completionSound ? "on" : "off"}
          options={[
            { value: "off", label: copy.soundOff },
            { value: "on", label: copy.soundOn },
          ]}
          onChange={(value) => onCompletionSoundChange(value === "on")}
          onFocus={() => setFocusedRow("completion-sound")}
          help={copy.completionSoundHelp}
        />
        <ActionRow
          id="open-history"
          label={copy.activityLabel("history", "Recent practice")}
          active={focusedRow === "open-history"}
          onFocus={() => setFocusedRow("open-history")}
          onClick={onOpenHistory}
        />
        <ActionRow
          id="open-data-transfer"
          label={copy.activityLabel("data-transfer", "Back up and restore data")}
          active={focusedRow === "open-data-transfer"}
          onFocus={() => setFocusedRow("open-data-transfer")}
          onClick={onOpenDataTransfer}
        />
        <ActionRow
          id="reset-settings"
          label={copy.resetSettings}
          active={focusedRow === "reset-settings"}
          onFocus={() => setFocusedRow("reset-settings")}
          onClick={onReset}
        />
      </div>
      {labels.map((message) => <p key={message} className="notice" role="status">{message}</p>)}
    </section>
  );
}
