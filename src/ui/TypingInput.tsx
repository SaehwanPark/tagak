import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { hasReachedEnd, insertSpaceAtSelection } from "../domain/typing";
import { useFocus } from "./useFocus";

type TypingInputProps = {
  language: "ko" | "en";
  target: string;
  onInput: (value: string, at: number) => void;
  onSubmit: () => void;
  onSpaceSubmit: (value: string, at: number) => void;
  onBack: () => void;
  onBlockedEdit?: () => void;
};

const imeShortcuts = new Set<string>();
// Keep WebView2's compositionend/confirmation Enter pair separate from a later submit key.
const imeEnterConfirmationWindowMs = 100;

if (typeof window !== "undefined") {
  window.addEventListener("keyup", (event) => {
    imeShortcuts.delete(physicalKeyCode(event.key, event.code));
  });
  window.addEventListener("blur", () => imeShortcuts.clear());
}

function physicalKeyCode(key: string, code: string): string {
  return key === " " || key === "Spacebar" || code === "Space" ? "Space" : code || key;
}

export function TypingInput({ language, target, onInput, onSubmit, onSpaceSubmit, onBack, onBlockedEdit }: TypingInputProps) {
  const field = useFocus<HTMLInputElement>();
  const composing = useRef(false);
  const spacePressedDuringComposition = useRef(false);
  const spaceInputDuringComposition = useRef(false);
  const compositionJustEnded = useRef(false);
  const compositionEndedAt = useRef<number | null>(null);
  // A trailing IME Space event can arrive after keyup, so key release must not clear this guard.
  const pendingCompositionSpace = useRef<{ input: string; caret: number } | null>(null);
  const confirmed = useRef("");

  function commit(value: string) {
    if (confirmed.current === value) return;
    confirmed.current = value;
    onInput(value, performance.now());
  }

  function applyCompositionSpace(input: HTMLInputElement, at: number, spaceAlreadyInserted = false) {
    const value = input.value;
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;

    if (spaceAlreadyInserted && start === end && start > 0 && value[start - 1] === " ") {
      const withoutSpace = `${value.slice(0, start - 1)}${value.slice(start)}`;
      if (hasReachedEnd(target, withoutSpace)) {
        confirmed.current = withoutSpace;
        pendingCompositionSpace.current = { input: value, caret: start };
        onSpaceSubmit(withoutSpace, at);
        return;
      }

      pendingCompositionSpace.current = { input: value, caret: start };
      commit(value);
      return;
    }

    if (hasReachedEnd(target, value)) {
      confirmed.current = value;
      pendingCompositionSpace.current = { input: value, caret: start };
      onSpaceSubmit(value, at);
      return;
    }

    const insertion = insertSpaceAtSelection(value, start, end);
    input.value = insertion.input;
    input.setSelectionRange(insertion.caret, insertion.caret);
    pendingCompositionSpace.current = { input: insertion.input, caret: insertion.caret };
    commit(insertion.input);
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    const native = event.nativeEvent;
    const code = physicalKeyCode(event.key, event.code);
    const spaceKey = code === "Space";
    if (imeShortcuts.has(code)) {
      event.preventDefault();
      return;
    }
    if (
      event.key === "Enter" &&
      compositionJustEnded.current &&
      compositionEndedAt.current !== null &&
      performance.now() - compositionEndedAt.current <= imeEnterConfirmationWindowMs
    ) {
      event.preventDefault();
      compositionJustEnded.current = false;
      imeShortcuts.add(code);
      return;
    }
    pendingCompositionSpace.current = null;
    // Some browsers report isComposing=false on the key that ends an IME edit.
    if (composing.current || native.isComposing || native.keyCode === 229) {
      if (event.key === "Enter" || event.key === "Escape" || code === "Enter" ||
          code === "NumpadEnter" || spaceKey) {
        imeShortcuts.add(code);
      }
      if (spaceKey) {
        if (!spacePressedDuringComposition.current) {
          spaceInputDuringComposition.current = false;
        }
        spacePressedDuringComposition.current = true;
      }
      return;
    }
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (spaceKey && compositionJustEnded.current) {
      event.preventDefault();
      compositionJustEnded.current = false;
      compositionEndedAt.current = null;
      imeShortcuts.add(code);
      applyCompositionSpace(event.currentTarget, performance.now());
      return;
    }
    compositionJustEnded.current = false;
    compositionEndedAt.current = null;
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
    if (spaceKey && hasReachedEnd(target, event.currentTarget.value)) {
      event.preventDefault();
      onSpaceSubmit(event.currentTarget.value, performance.now());
    }
  }

  return (
    <input
      id="typing-input"
      ref={field}
      type="text"
      lang={language}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      aria-describedby="typing-target typing-hint"
      onCompositionStart={() => {
        composing.current = true;
        compositionJustEnded.current = false;
        compositionEndedAt.current = null;
        if (!spacePressedDuringComposition.current) {
          spaceInputDuringComposition.current = false;
        }
      }}
      onCompositionEnd={(event) => {
        composing.current = false;
        const value = event.currentTarget.value;
        if (!spacePressedDuringComposition.current) {
          compositionJustEnded.current = true;
          compositionEndedAt.current = performance.now();
          commit(value);
          return;
        }

        spacePressedDuringComposition.current = false;
        compositionJustEnded.current = false;
        compositionEndedAt.current = null;
        const selectionStart = event.currentTarget.selectionStart ?? value.length;
        const selectionEnd = event.currentTarget.selectionEnd ?? value.length;
        // macOS IME may commit Space before compositionend without a matching input event.
        const spaceAlreadyInserted = spaceInputDuringComposition.current ||
          (selectionStart === selectionEnd && selectionStart > 0 && value[selectionStart - 1] === " ");
        spaceInputDuringComposition.current = false;
        applyCompositionSpace(event.currentTarget, performance.now(), spaceAlreadyInserted);
      }}
      onBeforeInput={(event) => {
        const native = event.nativeEvent as InputEvent;
        const isSpaceText = native.data === " ";
        if (!isSpaceText) return;

        // IMEs can deliver Space's text event on either side of compositionend.
        if (composing.current || native.isComposing) {
          event.preventDefault();
          if (!spacePressedDuringComposition.current) {
            spaceInputDuringComposition.current = false;
          }
          spacePressedDuringComposition.current = true;
          imeShortcuts.add("Space");
          return;
        }

        const pending = pendingCompositionSpace.current;
        if (pending) {
          event.preventDefault();
          return;
        }

        if (compositionJustEnded.current) {
          event.preventDefault();
          compositionJustEnded.current = false;
          imeShortcuts.add("Space");
          applyCompositionSpace(event.currentTarget, performance.now());
        }
      }}
      onInput={(event) => {
        const native = event.nativeEvent as InputEvent;
        const isSpaceText = native.data === " ";
        if (composing.current || native.isComposing) {
          if (spacePressedDuringComposition.current && isSpaceText) {
            spaceInputDuringComposition.current = true;
          }
          return;
        }

        const pending = pendingCompositionSpace.current;
        if (pending && isSpaceText) {
          const duplicate = insertSpaceAtSelection(pending.input, pending.caret, pending.caret).input;
          if (event.currentTarget.value === duplicate) {
            event.currentTarget.value = pending.input;
            event.currentTarget.setSelectionRange(pending.caret, pending.caret);
            pendingCompositionSpace.current = null;
            return;
          }
        }

        if (compositionJustEnded.current && isSpaceText) {
          compositionJustEnded.current = false;
          imeShortcuts.add("Space");
          applyCompositionSpace(event.currentTarget, performance.now(), true);
          return;
        }

        pendingCompositionSpace.current = null;
        commit(event.currentTarget.value);
      }}
      onKeyDown={handleKey}
      onKeyUp={(event) => {
        const code = physicalKeyCode(event.key, event.code);
        imeShortcuts.delete(code);
      }}
      onBlur={() => {
        spacePressedDuringComposition.current = false;
        spaceInputDuringComposition.current = false;
        compositionJustEnded.current = false;
        compositionEndedAt.current = null;
        pendingCompositionSpace.current = null;
      }}
      onPaste={(event) => {
        event.preventDefault();
        onBlockedEdit?.();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onBlockedEdit?.();
      }}
    />
  );
}
