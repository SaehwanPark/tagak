import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { InterfaceText } from "../content/interfaceText";
import { focusWithinScrollRegion } from "./focusWithinScrollRegion";
type MenuEntry = { id: string; label: string; detail?: string; creditLabel?: string };

type ActivityMenuProps<Entry extends MenuEntry> = {
  activities: readonly Entry[];
  title: string;
  selected: string | null;
  home?: boolean;
  showQuitHint?: boolean;
  onStart: (activity: Entry) => void;
  onOpenHelp?: () => void;
  onBack?: () => void;
  copy: InterfaceText;
};

export function ActivityMenu<Entry extends MenuEntry>({
  activities, title, selected, home = false, showQuitHint = false, onStart, onOpenHelp, onBack, copy,
}: ActivityMenuProps<Entry>) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buttons = Array.from(list.current?.querySelectorAll("button") ?? []);
    const target = buttons.find((button) => button.dataset.activity === selected) ?? buttons[0];
    focusWithinScrollRegion(target);
  }, [selected]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const keys = ["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
    const current = buttons.findIndex((button) => button === event.target);
    if (current < 0) return;
    event.preventDefault();
    let nextIndex: number;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = buttons.length - 1;
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      const direction = event.key === "PageDown" ? 1 : -1;
      const currentBounds = buttons[current]?.getBoundingClientRect();
      const visibleDistance = Math.max(0, event.currentTarget.clientHeight - (currentBounds?.height ?? 0));
      const destinationTop = (currentBounds?.top ?? 0) + direction * visibleDistance;
      nextIndex = current;
      if (direction > 0) {
        while (nextIndex + 1 < buttons.length && buttons[nextIndex + 1]!.getBoundingClientRect().top <= destinationTop) {
          nextIndex += 1;
        }
        if (nextIndex === current) nextIndex = current === buttons.length - 1 ? 0 : current + 1;
      } else {
        while (nextIndex > 0 && buttons[nextIndex - 1]!.getBoundingClientRect().top >= destinationTop) {
          nextIndex -= 1;
        }
        if (nextIndex === current) nextIndex = current === 0 ? buttons.length - 1 : current - 1;
      }
    } else {
      const step = event.key === "ArrowDown" ? 1 : -1;
      nextIndex = (current + step + buttons.length) % buttons.length;
    }
    focusWithinScrollRegion(buttons[nextIndex]);
  }

  return (
    <section className={home ? "screen home-menu-screen" : "screen"} onKeyDown={(event) => {
      if (!home && event.key === "Escape" && !event.nativeEvent.isComposing) onBack?.();
    }}>
      {onBack && <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>}
      <h1>{title}</h1>
      <div className="activity-menu" ref={list} role="group" aria-label={title} data-scroll-region onKeyDown={moveFocus}>
        {activities.map((activity) => (
          <button
            key={activity.id}
            data-activity={activity.id}
            className="lesson-button"
            type="button"
            onClick={() => onStart(activity)}
          >
            <span>
              <strong>
                {activity.label}
              </strong>
              {activity.detail && <small>{activity.detail}</small>}
              {activity.creditLabel && <small className="credit">{activity.creditLabel}</small>}
            </span>
            <span aria-hidden="true">↵</span>
          </button>
        ))}
      </div>
      <p className="keys">
        <kbd>↑</kbd> <kbd>↓</kbd> {copy.select} <kbd>Home</kbd> <kbd>End</kbd> {copy.firstLast} <kbd>Enter</kbd> {copy.start}
        {showQuitHint && <> <kbd>Esc</kbd> {copy.quitApp}</>}
      </p>
      {home && onOpenHelp && (
        <div className="home-shortcuts">
          <button type="button" className="home-help-link" onClick={onOpenHelp}>
            <kbd>?</kbd> {copy.helpEntry}
          </button>
          <span><kbd>s</kbd> {copy.settings}</span>
          <span><kbd>r</kbd> {copy.activityLabel("history", "")}</span>
        </div>
      )}
    </section>
  );
}
