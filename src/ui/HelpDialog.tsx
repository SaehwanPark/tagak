import { useEffect, useRef } from "react";
import type { InterfaceText } from "../content/interfaceText";
import { focusWithinScrollRegion, handleScrollRegionKeyDown } from "./focusWithinScrollRegion";

type HelpDialogProps = {
  copy: InterfaceText;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
};

export function HelpDialog({ copy, returnFocusTo, onClose }: HelpDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  function restoreFocus() {
    if (returnFocusTo?.isConnected && returnFocusTo.closest("[hidden]") === null) {
      focusWithinScrollRegion(returnFocusTo);
    }
  }

  function closeDialog() {
    const element = dialog.current;
    if (element?.open) element.close();
    restoreFocus();
    onClose();
  }

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    closeButton.current?.focus();
    return () => {
      if (element.open) element.close();
      restoreFocus();
    };
  }, [returnFocusTo]);

  return (
    <dialog
      ref={dialog}
      className="help-dialog"
      aria-labelledby="help-dialog-title"
      aria-describedby="help-dialog-intro"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
    >
      <div className="help-dialog-header">
        <h2 id="help-dialog-title">{copy.helpTitle}</h2>
        <button ref={closeButton} type="button" className="button secondary" onClick={closeDialog}>
          {copy.closeHelp}
        </button>
      </div>
      <div
        className="help-dialog-content"
        tabIndex={0}
        data-scroll-region
        onKeyDown={handleScrollRegionKeyDown}
      >
        <p id="help-dialog-intro">{copy.helpIntro}</p>
        <dl>
          <div>
            <dt>{copy.helpNavigationLabel}</dt>
            <dd>{copy.helpNavigation}</dd>
          </div>
          <div>
            <dt>{copy.helpTypingLabel}</dt>
            <dd>{copy.helpTyping}</dd>
          </div>
          <div>
            <dt>{copy.helpBackLabel}</dt>
            <dd>{copy.helpBack}</dd>
          </div>
          <div>
            <dt>{copy.helpShortcutsLabel}</dt>
            <dd>{copy.helpShortcuts}</dd>
          </div>
          <div>
            <dt>{copy.helpScreenCaptureLabel}</dt>
            <dd>{copy.helpScreenCapture}</dd>
          </div>
          <div>
            <dt>{copy.helpBeginnerLabel}</dt>
            <dd>{copy.helpBeginner}</dd>
          </div>
        </dl>
      </div>
    </dialog>
  );
}
