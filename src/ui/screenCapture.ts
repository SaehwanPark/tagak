import { toBlob } from "html-to-image";
import { saveBytes } from "../platform/fileAccess";

export async function downloadScreenCapture(root: HTMLElement, capturedAt = new Date()): Promise<"saved" | "cancelled"> {
  const image = await toBlob(root, {
    pixelRatio: 2,
    backgroundColor: getComputedStyle(root).backgroundColor,
    filter: (node) => node.getAttribute?.("data-capture-ignore") !== "true",
    style: { margin: "0" },
  });
  if (!image) throw new Error("Could not render the application screen.");

  return saveBytes(
    captureFilename(capturedAt),
    new Uint8Array(await image.arrayBuffer()),
    "image/png",
    { name: "PNG image", extensions: ["png"] },
  );
}

function captureFilename(date: Date): string {
  const part = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    part(date.getMonth() + 1),
    part(date.getDate()),
    part(date.getHours()),
    part(date.getMinutes()),
    part(date.getSeconds()),
  ].join("-");
  return `tagak-${stamp}.png`;
}
