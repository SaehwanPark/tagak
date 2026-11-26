import { useEffect, useRef } from "react";
import type { PracticeState } from "../app/usePractice";
import { focusWithinScrollRegion } from "./focusWithinScrollRegion";

/** The screen currently visible; settings wraps the screen it returned from. */
export function contentState(state: PracticeState) {
  return state.screen === "settings" ? state.returnState : state;
}

/**
 * Focus restoration needs the visible screen, not the state object, so the
 * window listeners read the latest screen through a ref.
 */
function restoreContentFocus(root: HTMLDivElement | null, state: PracticeState): void {
  if (!root) return;
  const visible = contentState(state);
  let target: HTMLElement | null = null;
  if (visible.screen === "menu" || visible.screen === "games" || visible.screen === "library") {
    target = Array.from(root.querySelectorAll<HTMLElement>("button[data-activity]"))
      .find((button) => button.dataset.activity === visible.selected) ?? null;
  } else if (visible.screen === "practice" || visible.screen === "passage") {
    target = root.querySelector("#typing-input");
  } else if (visible.screen === "result") {
    target = root.querySelector("h1[tabindex='-1']");
  } else if (visible.screen === "challenge") {
    target = root.querySelector("#typing-input") ?? root.querySelector("button:not(.back)");
  } else if (visible.screen === "venice") {
    target = root.querySelector("#venice-input") ?? root.querySelector(".venice-start-level");
  }
  focusWithinScrollRegion(target);
}

function canRestoreFocus(root: HTMLElement | null, target: HTMLElement): boolean {
  return root !== null && root.contains(target) &&
    target.closest("[hidden]") === null && !target.matches(":disabled");
}

function restoreScreenFocus(root: HTMLElement | null, screenContent: HTMLDivElement | null, state: PracticeState): void {
  if (state.screen === "settings" && root) {
    if (state.view === "menu") {
      const rows = Array.from(root.querySelectorAll<HTMLButtonElement>(".settings-menu [data-setting-row]:not(:disabled)"));
      const selected = rows.find((row) => row.dataset.settingRow === state.focusRow) ?? rows[0];
      const heading = root.querySelector<HTMLElement>(".settings-screen h1[tabindex='-1']");
      focusWithinScrollRegion(selected ?? heading);
      return;
    }
    const heading = Array.from(root.querySelectorAll<HTMLElement>("h1[tabindex='-1']"))
      .find((candidate) => candidate.closest("[hidden]") === null);
    focusWithinScrollRegion(heading);
    return;
  }
  restoreContentFocus(screenContent, state);
}

/**
 * Keeps keyboard focus on a meaningful control across tab/window switches and
 * settings round trips. Rendering and screen state stay in `App`.
 */
export function useScreenFocus(state: PracticeState) {
  const shell = useRef<HTMLElement>(null);
  const screenContent = useRef<HTMLDivElement>(null);
  const focusBeforeSettings = useRef<HTMLElement | null>(null);
  const lastAppFocus = useRef<HTMLElement | null>(null);
  const focusWasLost = useRef(false);
  const settingsWereOpen = useRef(false);
  const stateForFocus = useRef(state);
  stateForFocus.current = state;

  useEffect(() => {
    let restoreFrame: number | null = null;

    function rememberFocus(event: FocusEvent) {
      if (event.target instanceof HTMLElement && canRestoreFocus(shell.current, event.target)) {
        lastAppFocus.current = event.target;
      }
    }

    function markFocusLost() {
      const active = document.activeElement;
      if (active instanceof HTMLElement && canRestoreFocus(shell.current, active)) {
        lastAppFocus.current = active;
      }
      focusWasLost.current = true;
    }

    function restoreFocus() {
      if (!focusWasLost.current || document.visibilityState === "hidden") return;
      const previous = lastAppFocus.current;
      if (previous && canRestoreFocus(shell.current, previous)) {
        focusWithinScrollRegion(previous);
      } else {
        restoreScreenFocus(shell.current, screenContent.current, stateForFocus.current);
      }
      const active = document.activeElement;
      if (active instanceof HTMLElement && canRestoreFocus(shell.current, active)) {
        lastAppFocus.current = active;
        focusWasLost.current = false;
      }
    }

    function scheduleFocusRestore() {
      if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
      restoreFrame = window.requestAnimationFrame(() => {
        restoreFrame = null;
        restoreFocus();
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") markFocusLost();
      else scheduleFocusRestore();
    }

    document.addEventListener("focusin", rememberFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", markFocusLost);
    window.addEventListener("focus", scheduleFocusRestore);
    window.addEventListener("pageshow", scheduleFocusRestore);
    return () => {
      document.removeEventListener("focusin", rememberFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", markFocusLost);
      window.removeEventListener("focus", scheduleFocusRestore);
      window.removeEventListener("pageshow", scheduleFocusRestore);
      if (restoreFrame !== null) window.cancelAnimationFrame(restoreFrame);
    };
  }, []);

  useEffect(() => {
    if (settingsWereOpen.current && state.screen !== "settings") {
      const previousFocus = focusBeforeSettings.current;
      if (previousFocus && canRestoreFocus(shell.current, previousFocus)) focusWithinScrollRegion(previousFocus);
      else restoreContentFocus(screenContent.current, state);
      focusBeforeSettings.current = null;
    }
    settingsWereOpen.current = state.screen === "settings";
  }, [state.screen]);

  /** Remember the control that opened settings so closing returns to it. */
  const captureSettingsOrigin = () => {
    focusBeforeSettings.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  };

  return { shell, screenContent, captureSettingsOrigin };
}
