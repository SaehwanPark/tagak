import { useEffect, useRef } from "react";
import type { InterfaceText } from "../content/interfaceText";
import { focusWithinScrollRegion } from "./focusWithinScrollRegion";

type PracticeExitDialogProps = {
  copy: InterfaceText;
  returnFocusTo: HTMLElement | null;
  onContinue: () => void;
  onConfirmExit: () => void;
};

export function PracticeExitDialog({ copy, returnFocusTo, onContinue, onConfirmExit }: PracticeExitDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const confirmedExit = useRef(false);

  function restoreFocus() {
    if (returnFocusTo?.isConnected && returnFocusTo.closest("[hidden]") === null) {
      focusWithinScrollRegion(returnFocusTo);
    }
  }

  function continuePractice() {
    const element = dialog.current;
    if (element?.open) element.close();
    restoreFocus();
    onContinue();
  }

  function confirmExit() {
    if (confirmedExit.current) return;
    confirmedExit.current = true;
    const element = dialog.current;
    if (element?.open) element.close();
    onConfirmExit();
  }

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    continueButton.current?.focus();
    return () => {
      if (element.open) element.close();
      if (!confirmedExit.current) restoreFocus();
    };
  }, [returnFocusTo]);

  return (
    <dialog
      ref={dialog}
      className="practice-exit-dialog"
      aria-labelledby="practice-exit-title"
      aria-describedby="practice-exit-message"
      onCancel={(event) => {
        event.preventDefault();
        continuePractice();
      }}
      onKeyDown={(event) => {
        if (event.repeat) event.preventDefault();
      }}
    >
      <h2 id="practice-exit-title">{copy.practiceExitTitle}</h2>
      <p id="practice-exit-message">{copy.practiceExitMessage}</p>
      <div className="practice-exit-actions">
        <button ref={continueButton} type="button" className="button" onClick={continuePractice}>
          {copy.continuePractice}
        </button>
        <button type="button" className="button secondary" onClick={confirmExit}>
          {copy.endPractice}
        </button>
      </div>
    </dialog>
  );
}
