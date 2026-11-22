export const storedDataChangedEvent = "tagak:stored-data-changed";

export function notifyStoredDataChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(storedDataChangedEvent));
}
