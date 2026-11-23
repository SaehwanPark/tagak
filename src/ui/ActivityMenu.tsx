import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { InterfaceText } from "../content/interfaceText";
type MenuEntry = { id: string; label: string; tag?: string; detail?: string; creditLabel?: string };

// PageUp/PageDown move about one screenful of menu rows, matching the visible list height.
const pageSize = 5;

type ActivityMenuProps<Entry extends MenuEntry> = {
  activities: readonly Entry[];
  title: string;
  selected: string | null;
  home?: boolean;
  onStart: (activity: Entry) => void;
  onBack?: () => void;
  copy: InterfaceText;
};

export function ActivityMenu<Entry extends MenuEntry>({
  activities, title, selected, home = false, onStart, onBack, copy,
}: ActivityMenuProps<Entry>) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buttons = Array.from(list.current?.querySelectorAll("button") ?? []);
    const target = buttons.find((button) => button.dataset.activity === selected) ?? buttons[0];
    target?.focus();
  }, [selected]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const keys = ["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
    const current = buttons.findIndex((button) => button === event.target);
    if (current < 0) return;
    event.preventDefault();
    // Home/End jump to the list edges; PageUp/PageDown move a screenful of entries at once.
    const step = event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
    const distance = event.key === "PageUp" || event.key === "PageDown" ? pageSize : 1;
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? buttons.length - 1
        : (current + step * distance + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  }

  return (
    <section className={home ? "screen home-menu-screen" : "screen"} onKeyDown={(event) => {
      if (event.key === "Escape" && !event.nativeEvent.isComposing) onBack?.();
    }}>
      {onBack && <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>}
      <h1>{title}</h1>
      <div className="activity-menu" ref={list} onKeyDown={moveFocus}>
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
                {activity.tag && <span className="menu-tag">{activity.tag} </span>}
                {activity.label}
              </strong>
              {activity.detail && <small>{activity.detail}</small>}
              {activity.creditLabel && <small className="credit">{activity.creditLabel}</small>}
            </span>
            <span aria-hidden="true">↵</span>
          </button>
        ))}
      </div>
      <p className="keys"><kbd>↑</kbd> <kbd>↓</kbd> {copy.select} <kbd>Home</kbd> <kbd>End</kbd> {copy.firstLast} <kbd>Enter</kbd> {copy.start}</p>
    </section>
  );
}
