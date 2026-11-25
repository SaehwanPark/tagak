import type { KeyboardEvent as ReactKeyboardEvent } from "react";

/** Reveal a target inside its own list without moving another scroll container. */
export function revealWithinScrollRegion(target: HTMLElement | null | undefined): void {
  if (!target) return;
  const region = target.closest<HTMLElement>("[data-scroll-region]");
  if (!region) return;

  const regionBounds = region.getBoundingClientRect();
  const targetBounds = target.getBoundingClientRect();
  const regionTop = regionBounds.top + region.clientTop + 6;
  const regionBottom = regionBounds.top + region.clientTop + region.clientHeight - 6;

  if (targetBounds.top < regionTop) {
    region.scrollTop -= regionTop - targetBounds.top;
  } else if (targetBounds.bottom > regionBottom) {
    region.scrollTop += targetBounds.bottom - regionBottom;
  }
}

/** Focus a control without moving the document, revealing it inside its own list when needed. */
export function focusWithinScrollRegion(target: HTMLElement | null | undefined): void {
  if (!target) return;
  target.focus({ preventScroll: true });
  revealWithinScrollRegion(target);
}
/** Give a focused read-only scroll region predictable keyboard scrolling. */
export function handleScrollRegionKeyDown(event: ReactKeyboardEvent<HTMLElement>): void {
  const region = event.currentTarget;
  const target = event.target;
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.nativeEvent.isComposing) return;
  if (target !== region && target instanceof HTMLElement && target.closest("button, a, input, select, textarea, [contenteditable='true']")) return;

  const line = Number.parseFloat(getComputedStyle(region).lineHeight);
  const lineStep = Number.isFinite(line) ? line : 40;
  const pageStep = Math.max(lineStep, Math.round(region.clientHeight * 0.85));
  const nextTop = event.key === "ArrowDown" ? region.scrollTop + lineStep
    : event.key === "ArrowUp" ? region.scrollTop - lineStep
      : event.key === "PageDown" ? region.scrollTop + pageStep
        : event.key === "PageUp" ? region.scrollTop - pageStep
          : event.key === "Home" ? 0
            : event.key === "End" ? region.scrollHeight : null;
  if (nextTop === null || nextTop === region.scrollTop) return;

  event.preventDefault();
  region.scrollTop = nextTop;
}
