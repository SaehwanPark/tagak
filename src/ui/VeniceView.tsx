import { useEffect, useReducer, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { veniceWords } from "../content/veniceWords";
import type { InterfaceText } from "../content/interfaceText";
import type { Language } from "../content/lessons";
import {
  createVeniceReady,
  fallDurationMs,
  isVeniceWordHidden,
  rankVeniceTopScores,
  reduceVeniceState,
  shouldRecordVeniceRun,
  targetCpm,
  veniceLevelCount,
  veniceStageQuota,
} from "../domain/venice";
import type { VeniceAction, VeniceRun, VeniceState } from "../domain/venice";
import { readVeniceRecords, saveVeniceRun, veniceStorageKey } from "../storage/veniceStorage";
import { storedDataChangedEvent } from "../storage/storageEvents";
import type { VeniceRecords, VeniceStorageRead } from "../storage/veniceStorage";
import { useFocus } from "./useFocus";
import { playVeniceSound } from "./veniceSound";

type VeniceViewProps = {
  onBack: () => void;
  copy: InterfaceText;
  interfaceLanguage: Language;
  soundEnabled: boolean;
  settingsOpen: boolean;
};

function reduce(state: VeniceState, action: VeniceAction): VeniceState {
  return reduceVeniceState(state, action, veniceWords);
}

function newRunId(): string {
  return crypto.randomUUID();
}

function newSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] ?? Date.now();
}

function visibleRecords(read: VeniceStorageRead): VeniceRecords {
  return read.ok ? read.records : { recentRuns: [], topScores: [] };
}

function stageProgress(state: Extract<VeniceState, { phase: "playing" | "paused" }>) {
  return state.runtime.levelStats[state.runtime.levelStats.length - 1]
    ?? { level: state.runtime.level, spawned: 0, typedCorrectly: 0, missed: 0, durationMs: 0 };
}

export function VeniceView({ onBack, copy, interfaceLanguage, soundEnabled, settingsOpen }: VeniceViewProps) {
  const [storageRead, setStorageRead] = useState(readVeniceRecords);
  const [saveFailed, setSaveFailed] = useState(false);
  const [memoryRuns, setMemoryRuns] = useState<VeniceRun[]>([]);
  const [windowFocused, setWindowFocused] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== "hidden");
  const [userPaused, setUserPaused] = useState(false);
  const composing = useRef(false);
  const compositionKeys = useRef(new Set<string>());
  const saveStarted = useRef(new Set<string>());
  const inputResetVersion = useRef(0);
  const [state, dispatch] = useReducer(reduce, storageRead, (initial) =>
    createVeniceReady(initial.ok ? initial.records.recentRuns : []));
  const previousSoundState = useRef(state);
  const startButton = useFocus<HTMLButtonElement>(state.phase === "ready");
  const resultHeading = useFocus<HTMLHeadingElement>(state.phase === "finished");
  const inputField = useFocus<HTMLInputElement>(state.phase === "playing");
  const runtime = state.phase === "playing" || state.phase === "paused" ? state.runtime : null;
  const currentLevelStats = state.phase === "playing" || state.phase === "paused" ? stageProgress(state) : null;
  const isBlocked = settingsOpen || !windowFocused || !pageVisible || userPaused;

  useEffect(() => {
    const handleBlur = () => setWindowFocused(false);
    const handleFocus = () => setWindowFocused(true);
    const handleVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    const handleStorage = (event: StorageEvent) => {
      if (event.key === veniceStorageKey) setStorageRead(readVeniceRecords());
    };
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("storage", handleStorage);
    const syncRestored = () => setStorageRead(readVeniceRecords());
    window.addEventListener(storedDataChangedEvent, syncRestored);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(storedDataChangedEvent, syncRestored);
    };
  }, []);

  useEffect(() => {
    if (isBlocked && state.phase === "playing") {
      dispatch({ type: "pause" });
    } else if (!isBlocked && state.phase === "paused") {
      dispatch({ type: "resume", at: performance.now() });
    }
  }, [isBlocked, state.phase]);

  useEffect(() => {
    const previous = previousSoundState.current;
    if (previous.phase === "playing" && state.phase === "playing") {
      if (state.runtime.typedWords > previous.runtime.typedWords) playVeniceSound("hit", soundEnabled);
      if (state.runtime.missedWords > previous.runtime.missedWords) playVeniceSound("damage", soundEnabled);
    } else if ((previous.phase === "playing" || previous.phase === "paused") && state.phase === "finished") {
      playVeniceSound("game-over", soundEnabled);
    }
    previousSoundState.current = state;
  }, [state, soundEnabled]);

  useEffect(() => {
    if (settingsOpen || (state.phase !== "playing" && state.phase !== "paused")) return;
    const finishOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || composing.current || event.isComposing
        || event.keyCode === 229 || compositionKeys.current.has("Escape")) return;
      event.preventDefault();
      dispatch({ type: "finish", completedAt: Date.now() });
    };
    window.addEventListener("keydown", finishOnEscape);
    return () => window.removeEventListener("keydown", finishOnEscape);
  }, [settingsOpen, state.phase]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    let frame = 0;
    let lastUpdateAt = 0;
    const update = (at: number) => {
      if (at - lastUpdateAt >= 50) {
        lastUpdateAt = at;
        dispatch({ type: "tick", at, completedAt: Date.now() });
      }
      frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "finished" || !shouldRecordVeniceRun(state.run) || saveStarted.current.has(state.run.id)) return;
    saveStarted.current.add(state.run.id);
    setMemoryRuns((previous) => [...previous.filter((run) => run.id !== state.run.id), state.run].slice(-30));
    void saveVeniceRun(state.run).then((result) => {
      if (result.ok) {
        setStorageRead(result);
        setSaveFailed(false);
      }
      else setSaveFailed(true);
    });
  }, [state]);

  useEffect(() => {
    if (!runtime || state.phase !== "playing" || runtime.typedWords === inputResetVersion.current) return;
    inputResetVersion.current = runtime.typedWords;
    if (inputField.current) {
      inputField.current.value = runtime.input;
      inputField.current.focus();
    }
  }, [runtime?.typedWords, runtime?.input, state.phase]);

  const stored = visibleRecords(storageRead);
  const currentRun = state.phase === "finished" && shouldRecordVeniceRun(state.run) ? state.run : null;
  const allMemoryRuns = currentRun
    ? [...memoryRuns.filter((run) => run.id !== currentRun.id), currentRun]
    : memoryRuns;
  const topScores = rankVeniceTopScores([...stored.topScores, ...allMemoryRuns]);
  const recentRuns = [...new Map([...stored.recentRuns, ...allMemoryRuns].map((run) => [run.id, run])).values()]
    .sort((left, right) => left.completedAt - right.completedAt)
    .slice(-30);

  function start() {
    setUserPaused(false);
    setSaveFailed(false);
    dispatch({
      type: "start",
      at: performance.now(),
      startedAt: Date.now(),
      seed: newSeed(),
      id: newRunId(),
    });
  }

  function finish() {
    if (state.phase === "playing" || state.phase === "paused") {
      dispatch({ type: "finish", completedAt: Date.now() });
    }
  }

  function updateInput(input: string) {
    if (state.phase === "playing" && input !== state.runtime.input) playVeniceSound("typing", soundEnabled);
    dispatch({ type: "input", input });
  }

  function returnToReady() {
    setUserPaused(false);
    setSaveFailed(false);
    dispatch({ type: "return-to-ready", recentRuns });
  }

  function handleReadyKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.nativeEvent.isComposing || event.repeat) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
      return;
    }
    if (event.target instanceof HTMLSelectElement) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (state.phase === "ready") {
        const change = event.key === "ArrowUp" ? 1 : -1;
        dispatch({ type: "select-level", level: state.startLevel + change });
      }
    } else if (/^[0-9]$/.test(event.key) && state.phase === "ready") {
      event.preventDefault();
      const level = Number(event.key) || 10;
      dispatch({ type: "select-level", level });
    }
  }

  function handlePlayingKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.repeat || composing.current || compositionKeys.current.has("Escape")
      || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if (event.key === "Escape") {
      event.preventDefault();
      finish();
    }
  }

  if (state.phase === "ready") {
    return (
      <section className="screen venice-screen" onKeyDown={handleReadyKeys}>
        <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>
        <h1>{copy.veniceTitle}</h1>
        <p className="lede">{copy.veniceInstruction}</p>
        <div className="venice-ready-panel">
          <label htmlFor="venice-level">{copy.veniceLevel}</label>
          <select
            id="venice-level"
            className="venice-start-level"
            value={state.startLevel}
            onChange={(event) => dispatch({ type: "select-level", level: Number(event.currentTarget.value) })}
          >
            {Array.from({ length: veniceLevelCount }, (_, index) => index + 1).map((level) => (
              <option key={level} value={level}>{level} · {targetCpm(level)} CPM</option>
            ))}
          </select>
          <p className="venice-recommendation">{copy.veniceRecommended(state.recommendedLevel)}</p>
          <button ref={startButton} className="button" type="button" onClick={start}>
            {copy.veniceStart}
          </button>
        </div>
        <p className="keys">{copy.veniceReadyHint}</p>
      </section>
    );
  }

  if (state.phase === "finished") {
    const run = state.run;
    const dateFormatter = new Intl.DateTimeFormat(interfaceLanguage === "ko" ? "ko-KR" : "en-US", { dateStyle: "short" });
    function restart() {
      setUserPaused(false);
      setSaveFailed(false);
      dispatch({
        type: "start",
        at: performance.now(),
        startedAt: Date.now(),
        seed: newSeed(),
        id: newRunId(),
      });
    }
    return (
      <section className="screen venice-screen" onKeyDown={(event) => {
        if (event.repeat || event.nativeEvent.isComposing) return;
        if (event.key === "Escape") onBack();
        if (event.key === "Enter" && event.target === resultHeading.current) restart();
      }}>
        <h1 ref={resultHeading} tabIndex={-1}>{copy.veniceResult}</h1>
        <dl className="scores venice-result-summary">
          <div><dt>{copy.veniceScore}</dt><dd>{run.score.toLocaleString(interfaceLanguage)}</dd></div>
          <div><dt>{copy.veniceStartLevel}</dt><dd>{run.startLevel}</dd></div>
          <div><dt>{copy.veniceHighestLevel}</dt><dd>{run.highestLevel}</dd></div>
          <div><dt>{copy.veniceTypedWords}</dt><dd>{copy.solvedWordCount(run.typedWords)}</dd></div>
          <div><dt>{copy.veniceMissedWords}</dt><dd>{copy.solvedWordCount(run.missedWords)}</dd></div>
          <div><dt>{copy.elapsedTime}</dt><dd>{copy.elapsedTimeValue((run.durationMs / 1_000).toFixed(1))}</dd></div>
        </dl>
        <h2 className="venice-table-title">{copy.veniceTopScores}</h2>
        {topScores.length === 0 ? <p>{copy.veniceNoScores}</p> : (
          <div className="venice-table-scroll" role="region" aria-label={copy.veniceTopScores} tabIndex={0}>
            <table className="venice-scores-table">
              <thead><tr>
                <th scope="col">{copy.veniceRank}</th>
                <th scope="col">{copy.veniceScore}</th>
                <th scope="col">{copy.veniceStartLevel}</th>
                <th scope="col">{copy.veniceHighestLevel}</th>
                <th scope="col">{copy.veniceTypedWords}</th>
                <th scope="col">{copy.veniceDate}</th>
              </tr></thead>
              <tbody>{topScores.map((entry, index) => (
                <tr key={entry.id} aria-current={entry.id === run.id ? "true" : undefined}>
                  <td>{index + 1}</td>
                  <td>{entry.score.toLocaleString(interfaceLanguage)}</td>
                  <td>{entry.startLevel}</td>
                  <td>{entry.highestLevel}</td>
                  <td>{entry.typedWords}</td>
                  <td>{dateFormatter.format(entry.completedAt)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {!storageRead.ok && <p className="venice-storage-notice" role="status">{copy.veniceReadFailed}</p>}
        {saveFailed && <p className="venice-storage-notice" role="status">{copy.veniceSaveFailed}</p>}
        <div className="result-actions venice-actions">
          <button className="button" type="button" onClick={restart}>{copy.venicePlayAgain}</button>
          <button className="button secondary" type="button" onClick={returnToReady}>{copy.veniceChooseLevel}</button>
          <button className="button secondary" type="button" onClick={onBack}>{copy.backToMenu}</button>
        </div>
        <p className="keys"><kbd>Enter</kbd> {copy.venicePlayAgain} <kbd>Esc</kbd> {copy.menu}</p>
      </section>
    );
  }

  const paused = state.phase === "paused";
  const currentEffect = Object.entries(runtime?.effects ?? {}).find(([, expiresAt]) =>
    expiresAt !== undefined && expiresAt > (runtime?.elapsedMs ?? 0))?.[0];
  return (
    <section className="screen venice-screen" onKeyDown={handlePlayingKeys}>
      <div className="venice-header">
        <h1>{copy.veniceTitle}</h1>
        <button className="button secondary venice-pause-button" type="button" onClick={() => setUserPaused(!userPaused)}>
          {paused ? copy.veniceResume : copy.venicePause}
        </button>
      </div>
      <dl className="venice-hud" aria-label={copy.veniceTitle}>
        <div><dt>{copy.veniceLevel}</dt><dd>{runtime?.level}</dd></div>
        <div><dt>{copy.veniceTargetCpm}</dt><dd>{targetCpm(runtime?.level ?? 1)}</dd></div>
        <div><dt>{copy.veniceScore}</dt><dd>{runtime?.score.toLocaleString(interfaceLanguage)}</dd></div>
        <div>
          <dt>{runtime?.level === veniceLevelCount
            ? copy.veniceEndlessProgress(currentLevelStats?.spawned ?? 0)
            : copy.veniceStageProgress(currentLevelStats?.spawned ?? 0, veniceStageQuota)}</dt>
          <dd>{runtime?.level} / 14</dd>
        </div>
        <div>
          <dt>{copy.veniceTower}</dt>
          <dd className="venice-tower" role="img" aria-label={copy.veniceTower + ": " + runtime?.towerBlocks + " / 12"}>
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} className={index < (runtime?.towerBlocks ?? 0) ? "venice-block" : "venice-block damaged"} />
            ))}
          </dd>
        </div>
      </dl>
      <div className="venice-board">
        <div className="venice-skyline" aria-hidden="true" />
        <div className="venice-waterline" aria-hidden="true" />
        <div className="venice-collision-line" aria-hidden="true"><span>{copy.veniceCollisionLine}</span></div>
        {(runtime?.words ?? []).map((word) => {
          const hidden = runtime !== null && isVeniceWordHidden(word.id, runtime);
          const syllables = Array.from(word.text).length;
          const fontSizeRem = Math.max(0.58, 1.15 - (syllables - 2) * 0.095);
          const lanePosition = ((word.lane + 0.5) / 7) * 100;
          return (
            <span
              key={word.id}
              className={"venice-falling-word" + (word.kind === "virus" ? " virus" : "") + (hidden ? " hidden-word" : "")}
              style={{
                left: `clamp(2.7rem, ${lanePosition}%, calc(100% - 2.7rem))`,
                top: word.y + "%",
                fontSize: fontSizeRem + "rem",
              }}
              aria-hidden={hidden}
            >
              {word.text}
            </span>
          );
        })}
        {(runtime?.mines ?? []).map((mine) => (
          <span key={mine.id} className="venice-mine" style={{ left: (((mine.lane + 0.5) / 7) * 100) + "%", top: mine.y + "%" }} aria-hidden="true">✹</span>
        ))}
        <div className="venice-tower-visual" aria-hidden="true">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className={index < (runtime?.towerBlocks ?? 0) ? "venice-block" : "venice-block damaged"} />
          ))}
        </div>
        {paused && <div className="venice-pause-overlay" role="status">{copy.venicePaused}</div>}
      </div>
      <div className="entry venice-entry">
        <label htmlFor="venice-input">{copy.veniceInputLabel}</label>
        <input
          id="venice-input"
          ref={inputField}
          type="text"
          lang="ko"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby="venice-key-hint venice-status"
          disabled={paused}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(event) => {
            composing.current = false;
            updateInput(event.currentTarget.value);
          }}
          onInput={(event) => updateInput(event.currentTarget.value)}
          onKeyDown={(event) => {
            const native = event.nativeEvent;
            const code = native.code === "Space" || event.key === " " ? "Space" : native.code || event.key;
            if (composing.current || native.isComposing || native.keyCode === 229) {
              if (event.key === "Enter" || event.key === " " || event.key === "Escape") compositionKeys.current.add(code);
              return;
            }
            if (compositionKeys.current.has(code)) {
              event.preventDefault();
              return;
            }
            if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              dispatch({ type: "submit" });
            }
          }}
          onKeyUp={(event) => {
            const code = event.nativeEvent.code === "Space" || event.key === " " ? "Space" : event.nativeEvent.code || event.key;
            compositionKeys.current.delete(code);
          }}
          onPaste={(event) => event.preventDefault()}
          onDrop={(event) => event.preventDefault()}
        />
      </div>
      <div className="practice-actions venice-bottom-actions">
        <p id="venice-key-hint" className="keys"><kbd>Space</kbd> / <kbd>Enter</kbd> {copy.veniceSubmit} <kbd>Esc</kbd> {copy.veniceFinish}</p>
        <div className="result-actions">
          <button className="button" type="button" disabled={paused} onClick={() => dispatch({ type: "submit" })}>
            {copy.veniceSubmit}
          </button>
          <button className="button secondary" type="button" onClick={finish}>{copy.veniceFinish}</button>
        </div>
      </div>
      <p id="venice-status" className="notice" role="status" aria-live="polite">
        {runtime?.message === "mismatch" ? copy.veniceMismatch
          : runtime?.message ? copy.veniceEffectLabel(runtime.message)
            : runtime?.infectionActive ? copy.veniceInfectionActive : currentEffect ? copy.veniceEffectLabel(currentEffect) : ""}
      </p>
      <p className="venice-fall-hint" aria-hidden="true">{Math.round(fallDurationMs(runtime?.level ?? 1) / 1_000)}s</p>
    </section>
  );
}
