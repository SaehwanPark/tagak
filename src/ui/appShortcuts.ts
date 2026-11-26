export type AppShortcut = "help" | "settings" | "history";

export type ShortcutKeyEvent = Readonly<{
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
  isComposing: boolean;
  keyCode: number;
  defaultPrevented: boolean;
  editableTarget: boolean;
}>;

export function appShortcutFor(event: ShortcutKeyEvent): AppShortcut | null {
  if (
    event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229 ||
    event.editableTarget || event.altKey || event.ctrlKey || event.metaKey
  ) return null;

  if (event.key === "?") return "help";
  if (event.shiftKey) return null;
  if (event.key.toLowerCase() === "s") return "settings";
  if (event.key.toLowerCase() === "r") return "history";
  return null;
}
