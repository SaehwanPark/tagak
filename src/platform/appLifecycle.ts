import { isTauri } from "@tauri-apps/api/core";

export function quitDesktopApp(): void {
  if (!isTauri()) return;

  void import("@tauri-apps/api/app")
    .then(({ exit }) => exit())
    .catch((error: unknown) => {
      console.error("Could not quit the desktop app.", error);
    });
}
