import { useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import type { InterfaceText } from "../content/interfaceText";
import { saveBytes, openTextFile } from "../platform/fileAccess";
import { createDataBackup, decodeDataBackup, hasStoredData, restoreDataBackup } from "../storage/dataBackup";
import type { DataBackup } from "../storage/dataBackup";
import { useFocus } from "./useFocus";

type DataTransferViewProps = { onBack: () => void; copy: InterfaceText };

export function DataTransferView({ onBack, copy }: DataTransferViewProps) {
  const title = useFocus<HTMLHeadingElement>();
  const fileInput = useRef<HTMLInputElement>(null);
  const importButton = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<DataBackup | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function exportBackup() {
    setBusy(true);
    setNotice("");
    try {
      const content = createDataBackup();
      if (content === null) {
        setNotice(copy.backupExportError);
        return;
      }
      const filename = `tagak-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const result = await saveBytes(
        filename,
        new TextEncoder().encode(content),
        "application/json",
        { name: "JSON backup", extensions: ["json"] },
      );
      if (result === "saved") setNotice(copy.backupExportSuccess);
    } catch {
      setNotice(copy.backupExportError);
    } finally {
      setBusy(false);
    }
  }

  async function inspectFile(raw: string) {
    const decoded = decodeDataBackup(raw);
    if (!decoded.ok) {
      setPending(null);
      setNotice(copy.backupFormatError);
      return;
    }
    setNotice("");
    if (hasStoredData()) {
      setPending(decoded.backup);
      return;
    }
    await applyBackup(decoded.backup, "replace");
  }

  async function chooseImport() {
    setNotice("");
    if (isTauri()) {
      setBusy(true);
      try {
        const raw = await openTextFile({ name: "JSON backup", extensions: ["json"] });
        if (raw !== null) await inspectFile(raw);
      } catch {
        setNotice(copy.backupReadError);
      } finally {
        setBusy(false);
      }
      return;
    }
    fileInput.current?.click();
  }

  async function fileSelected(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      await inspectFile(await file.text());
    } catch {
      setNotice(copy.backupReadError);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
      setBusy(false);
    }
  }

  async function applyBackup(backup: DataBackup, mode: "merge" | "replace") {
    setBusy(true);
    setNotice("");
    const result = await restoreDataBackup(backup, mode);
    if (result.ok) {
      setPending(null);
      setNotice(mode === "merge" ? copy.backupImportSuccess : copy.backupReplaceSuccess);
    } else if (result.reason === "invalid-current-data") {
      setNotice(copy.backupCurrentDataError);
    } else {
      setNotice(copy.backupRestoreError);
    }
    setBusy(false);
  }

  function cancelConflict() {
    setPending(null);
    setNotice("");
    importButton.current?.focus();
  }

  return (
    <section className="screen" onKeyDown={(event) => {
      if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
      if (pending) cancelConflict();
      else onBack();
    }}>
      <button type="button" className="back" onClick={onBack}>{copy.backToSettings}</button>
      <h1 ref={title} tabIndex={-1}>{copy.dataTransferTitle}</h1>
      <p className="lede">{copy.dataTransferDescription}</p>
      <p>{copy.backupContents}</p>
      <div className="result-actions data-transfer-actions">
        <button type="button" className="button" disabled={busy} onClick={() => void exportBackup()}>
          {copy.backupExport}
        </button>
        <button ref={importButton} type="button" className="button secondary" disabled={busy} onClick={() => void chooseImport()}>
          {copy.backupImport}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          aria-label={copy.backupChooseFile}
          hidden
          onChange={(event) => void fileSelected(event.currentTarget.files?.[0])}
        />
      </div>
      {pending && (
        <div className="target" role="alertdialog" aria-label={copy.dataTransferTitle} aria-describedby="backup-conflict">
          <p id="backup-conflict">{copy.backupConflict}</p>
          <div className="result-actions">
            <button type="button" className="button secondary" disabled={busy} onClick={() => void applyBackup(pending, "merge")}>
              {copy.backupMerge}
            </button>
            <button type="button" className="button" disabled={busy} onClick={() => void applyBackup(pending, "replace")}>
              {copy.backupReplace}
            </button>
            <button type="button" className="button secondary" disabled={busy} onClick={cancelConflict}>
              {copy.cancel}
            </button>
          </div>
        </div>
      )}
      <p className="notice data-transfer-notice" role="status" aria-live="polite" aria-atomic="true">{notice}</p>
    </section>
  );
}
