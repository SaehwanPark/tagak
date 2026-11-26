import { useEffect, useRef, useState } from "react";

/** Tracks whether the app window can receive input, collapsing duplicate focus signals. */
export function useAppActivity(): { active: boolean; isActive: () => boolean } {
  const visible = useRef(document.visibilityState !== "hidden");
  const focused = useRef(true);
  const [active, setActive] = useState(visible.current);
  const activeRef = useRef(active);

  useEffect(() => {
    const update = () => {
      const nextActive = visible.current && focused.current;
      activeRef.current = nextActive;
      setActive((current) => current === nextActive ? current : nextActive);
    };
    const updateVisibility = () => {
      visible.current = document.visibilityState !== "hidden";
      update();
    };
    const markFocused = () => {
      focused.current = true;
      update();
    };
    const markBlurred = () => {
      focused.current = false;
      update();
    };

    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("focus", markFocused);
    window.addEventListener("blur", markBlurred);
    window.addEventListener("pageshow", markFocused);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("focus", markFocused);
      window.removeEventListener("blur", markBlurred);
      window.removeEventListener("pageshow", markFocused);
    };
  }, []);

  return { active, isActive: () => activeRef.current };
}
