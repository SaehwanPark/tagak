import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { challengeWords } from "../content/library";
import { advanceChallenge, challengeDurationMs, challengeElapsedMs, targetWord } from "../domain/challenge";
import type { ChallengeAction, ChallengeState } from "../domain/challenge";
import { TypingInput } from "./TypingInput";
import { useFocus } from "./useFocus";
import { createRunSeed } from "./randomSeed";
import type { InterfaceText } from "../content/interfaceText";

type ChallengeViewProps = {
  onBack: () => void;
  copy: InterfaceText;
  onWordComplete: () => void;
  appActive: boolean;
  isAppActive: () => boolean;
  settingsOpen: boolean;
};

function reduce(state: ChallengeState, action: ChallengeAction): ChallengeState {
  return advanceChallenge(challengeWords, state, action);
}

export function ChallengeView({ onBack, copy, onWordComplete, appActive, isAppActive, settingsOpen }: ChallengeViewProps) {
  const [state, dispatch] = useReducer(reduce, { phase: "ready" });
  const [blocked, setBlocked] = useState(false);
  const startButton = useFocus<HTMLButtonElement>(state.phase === "ready");
  const result = useFocus<HTMLHeadingElement>(state.phase === "finished");
  const running = state.phase === "running";
  const timerActive = running && state.pauseReasons.length === 0;
  const start = () => {
    setBlocked(false);
    dispatch({ type: "start", at: performance.now(), seed: createRunSeed() });
  };
  const stop = () => {
    const at = performance.now();
    if (!isAppActive()) {
      dispatch({ type: "pause-reason", reason: "app-inactive", paused: true, at });
      return;
    }
    dispatch({ type: "stop", at });
  };
  const submit = (input?: string, at = performance.now()) => {
    setBlocked(false);
    if (!isAppActive()) {
      dispatch({ type: "pause-reason", reason: "app-inactive", paused: true, at });
      if (input !== undefined) dispatch({ type: "input", input, at });
      return;
    }
    const inputToSubmit = input ?? (state.phase === "running" ? state.input : "");
    if (state.phase === "running" && state.pauseReasons.length === 0 &&
        inputToSubmit === targetWord(state.words, state.solved) &&
        challengeElapsedMs(state, at) < challengeDurationMs) onWordComplete();
    if (input !== undefined) dispatch({ type: "input", input, at });
    dispatch({ type: "submit", at });
  };

  useEffect(() => {
    if (!timerActive) return;
    const timer = window.setInterval(() => dispatch({ type: "tick", at: performance.now() }), 150);
    return () => window.clearInterval(timer);
  }, [timerActive]);

  useLayoutEffect(() => {
    dispatch({ type: "pause-reason", reason: "settings", paused: settingsOpen, at: performance.now() });
  }, [settingsOpen]);

  useLayoutEffect(() => {
    dispatch({ type: "pause-reason", reason: "app-inactive", paused: !appActive, at: performance.now() });
  }, [appActive]);

  if (state.phase === "ready") {
    return (
      <section className="screen challenge-screen" onKeyDown={(event) => {
        if (event.key === "Escape") onBack();
      }}>
        <button className="back" type="button" onClick={onBack}>{copy.backToMenu}</button>
        <h1>{copy.challengeTitle}</h1>
        <p className="lede">{copy.challengeInstruction}</p>
        <button ref={startButton} className="button" type="button" onClick={start}>{copy.challengeStart}</button>
      </section>
    );
  }

  if (state.phase === "finished") {
    return (
      <section className="screen challenge-screen" onKeyDown={(event) => {
        if (event.repeat || event.nativeEvent.isComposing) return;
        if (event.key === "Escape") onBack();
        if (event.key === "Enter" && event.target === result.current) start();
      }}>
        <h1 ref={result} tabIndex={-1} aria-describedby="challenge-outcome">{copy.challengeResult}</h1>
        <p className="lede" id="challenge-outcome">{state.timedOut ? copy.timeEnded : copy.challengeStopped}</p>
        <dl className="scores">
          <div><dt>{copy.solvedWords}</dt><dd>{copy.solvedWordCount(state.solved)}</dd></div>
          <div><dt>{copy.elapsedTime}</dt><dd>{copy.elapsedTimeValue((state.elapsedMs / 1000).toFixed(1))}</dd></div>
        </dl>
        <div className="result-actions">
          <button className="button" type="button" onClick={start}>{copy.retryChallenge}</button>
          <button className="button secondary" type="button" onClick={onBack}>{copy.returnTo(copy.menu)}</button>
        </div>
        <p className="keys"><kbd>Enter</kbd> {copy.retryChallenge} <kbd>Esc</kbd> {copy.menu}</p>
      </section>
    );
  }

  const remaining = Math.max(0, challengeDurationMs - challengeElapsedMs(state));
  return (
    <section className="screen challenge-screen challenge-running-screen">
      <h1>{copy.challengeTitle}</h1>
      <div className="target challenge-target">
        <div className="target-label">
          <span>{copy.remainingTime(Math.ceil(remaining / 1_000))}</span>
          <span>{copy.solvedWords}: {copy.solvedWordCount(state.solved)}</span>
        </div>
        <progress aria-label={copy.remainingTime(Math.ceil(remaining / 1_000))} max={challengeDurationMs} value={remaining} />
        <p id="typing-target" lang="ko">{targetWord(state.words, state.solved)}</p>
      </div>
      <div className="entry">
        <label htmlFor="typing-input">{copy.followAlong}</label>
        <TypingInput
          key={state.solved}
          language="ko"
          target={targetWord(state.words, state.solved)}
          onInput={(input, at) => {
            setBlocked(false);
            if (!isAppActive()) {
              dispatch({ type: "pause-reason", reason: "app-inactive", paused: true, at });
            }
            dispatch({ type: "input", input, at });
          }}
          onSubmit={submit}
          onSpaceSubmit={submit}
          onBack={stop}
          onBlockedEdit={() => setBlocked(true)}
        />
      </div>
      <p className="notice challenge-pause-note" role="status">
        {state.pauseReasons.length > 0 ? copy.challengePaused : copy.challengePauseNotice}
      </p>
      <div className="practice-actions">
        <p className="keys" id="typing-hint"><kbd>Enter</kbd> / <kbd>Space</kbd> {copy.submit} <kbd>Esc</kbd> {copy.stopChallenge}</p>
        <div className="result-actions">
          <button className="button" type="button" onClick={() => submit()}>{copy.submit}</button>
          <button className="button secondary" type="button" onClick={stop}>{copy.stopChallenge}</button>
        </div>
      </div>
      <p className="notice" role="status">
        {blocked ? copy.enterWord : state.missed ? copy.blockedWordInput : ""}
      </p>
    </section>
  );
}
