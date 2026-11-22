import { isTauri } from "@tauri-apps/api/core";

export type FileFilter = Readonly<{ name: string; extensions: string[] }>;

export async function saveBytes(
  filename: string,
  bytes: Uint8Array,
  mimeType: string,
  filter: FileFilter,
): Promise<"saved" | "cancelled"> {
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({ defaultPath: filename, filters: [filter] });
    if (path === null) return "cancelled";
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    await writeFile(path, bytes);
    return "saved";
  }

  const ownedBytes = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ownedBytes).set(bytes);
  const blob = new Blob([ownedBytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const download = document.createElement("a");
  download.href = url;
  download.download = filename;
  document.body.append(download);
  try {
    download.click();
  } finally {
    download.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
  return "saved";
}

export async function openTextFile(filter: FileFilter): Promise<string | null> {
  if (!isTauri()) throw new Error("Browser file selection uses the file input control.");
  const { open } = await import("@tauri-apps/plugin-dialog");
  const path = await open({
    multiple: false,
    filters: [filter],
    fileAccessMode: "scoped",
  });
  if (path === null) return null;
  const { readTextFile } = await import("@tauri-apps/plugin-fs");
  return readTextFile(path);
}

export function isMacKeyboard(): boolean {
  return typeof navigator !== "undefined" && navigator.platform.startsWith("Mac");
}
