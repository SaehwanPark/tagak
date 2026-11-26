import { describe, expect, it } from "vitest";
import { appShortcutFor } from "./appShortcuts";
import type { ShortcutKeyEvent } from "./appShortcuts";

function keyEvent(overrides: Partial<ShortcutKeyEvent> = {}): ShortcutKeyEvent {
  return {
    key: "s",
    code: "KeyS",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    repeat: false,
    isComposing: false,
    keyCode: 83,
    defaultPrevented: false,
    editableTarget: false,
    ...overrides,
  };
}

describe("home navigation shortcuts", () => {
  it("maps the help, settings, and history keys", () => {
    expect(appShortcutFor(keyEvent({ key: "?", code: "Slash", shiftKey: true }))).toBe("help");
    expect(appShortcutFor(keyEvent())).toBe("settings");
    expect(appShortcutFor(keyEvent({ key: "r", code: "KeyR" }))).toBe("history");
    expect(appShortcutFor(keyEvent({ key: "s", code: "KeyX" }))).toBe("settings");
    expect(appShortcutFor(keyEvent({ key: "ㄴ", code: "KeyS" }))).toBeNull();
  });

  it("ignores function keys and browser or OS modifier shortcuts", () => {
    for (const code of ["F1", "F2", "F3"]) {
      expect(appShortcutFor(keyEvent({ key: code, code }))).toBeNull();
    }
    expect(appShortcutFor(keyEvent({ ctrlKey: true }))).toBeNull();
    expect(appShortcutFor(keyEvent({ altKey: true }))).toBeNull();
    expect(appShortcutFor(keyEvent({ metaKey: true }))).toBeNull();
    expect(appShortcutFor(keyEvent({ shiftKey: true }))).toBeNull();
  });

  it("ignores editing, IME composition, repeat, and handled keys", () => {
    expect(appShortcutFor(keyEvent({ editableTarget: true }))).toBeNull();
    expect(appShortcutFor(keyEvent({ isComposing: true }))).toBeNull();
    expect(appShortcutFor(keyEvent({ keyCode: 229 }))).toBeNull();
    expect(appShortcutFor(keyEvent({ repeat: true }))).toBeNull();
    expect(appShortcutFor(keyEvent({ defaultPrevented: true }))).toBeNull();
  });
});
