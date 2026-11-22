import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { downloadScreenCapture } from "../ui/screenCapture";
import { isMacKeyboard } from "../platform/fileAccess";

type CaptureStatus = "idle" | "saving" | "saved" | "failed";

export function useScreenCapture(target: RefObject<HTMLElement | null>) {
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const saving = useRef(false);

  const save = useCallback(async () => {
    if (saving.current) return;
    const root = target.current;
    if (!root) {
      setStatus("failed");
      return;
    }

    saving.current = true;
    setStatus("saving");
    try {
      const result = await downloadScreenCapture(root);
      setStatus(result === "saved" ? "saved" : "idle");
    } catch {
      setStatus("failed");
    } finally {
      saving.current = false;
    }
  }, [target]);

  useEffect(() => {
    let composing = false;
    const onCompositionStart = () => { composing = true; };
    const onCompositionEnd = () => { composing = false; };
    const onKeyDown = (event: KeyboardEvent) => {
      const mac = isMacKeyboard();
      const shortcutPressed = mac
        ? event.metaKey && !event.ctrlKey
        : event.ctrlKey && !event.metaKey;
      if (!shortcutPressed || event.altKey || event.shiftKey || event.code !== "KeyS") return;
      if (composing || event.isComposing || event.keyCode === 229) return;

      event.preventDefault();
      if (!event.repeat) void save();
    };

    window.addEventListener("compositionstart", onCompositionStart);
    window.addEventListener("compositionend", onCompositionEnd);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("compositionstart", onCompositionStart);
      window.removeEventListener("compositionend", onCompositionEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [save]);

  return {
    isSaving: status === "saving",
    status,
    shortcutLabel: isMacKeyboard() ? "⌘S" : "Ctrl+S",
    save,
  };
}
