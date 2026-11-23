import { useState } from "react";
import type { ReactNode } from "react";
import type { Language, TextCredit } from "../content/lessons";
import type { InterfaceText } from "../content/interfaceText";
import { splitCharacters } from "../domain/typing";
import type { PracticeSession, TypingScore } from "../domain/typing";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import { TypingInput } from "./TypingInput";
import { Scoreboard } from "./Scoreboard";

type PracticeViewProps = {
  title: string;
  language: Language;
  prompt: string;
  lineCredit?: TextCredit | null;
  showLineSource?: boolean;
  session: PracticeSession;
  /**
   * Speed for the current item is held back until the item is submitted. The
   * live score therefore only carries accuracy; the speed appears once a line,
   * word, or bundle is complete.
   */
  liveScore: () => TypingScore;
  previous?: TypingScore | null;
  previousLabel?: string;
  context?: ReactNode;
  speedUnit: TypingSpeedUnit;
  backLabel?: string;
  copy: InterfaceText;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number, input?: string) => void;
  onFinish?: () => void;
  onBack: () => void;
};

export function PracticeView({
  title, language, prompt, lineCredit = null, showLineSource = false,
  session, liveScore, previous, previousLabel, context, speedUnit,
  backLabel, onInput, onSubmit, onFinish, onBack, copy,
}: PracticeViewProps) {
  const [notice, setNotice] = useState("");
  const target = splitCharacters(prompt);
  const typed = splitCharacters(session.input);
  const score = liveScore();

  function submit(input?: string, at = performance.now()) {
    const inputToSubmit = input ?? session.input;
    const remainingAtSubmit = target.length - splitCharacters(inputToSubmit).length;
    if (remainingAtSubmit > 0) {
      setNotice(copy.remainingCharacters(remainingAtSubmit));
      return;
    }
    onSubmit(at, input);
  }

  return (
    <section className="screen">
      <button className="back" type="button" onClick={onBack}>← {backLabel ?? copy.menu}</button>
      <h1 lang={language}>{title}</h1>
      {context}
      <div className="target">
        <div className="target-label"><strong>{copy.currentPrompt}</strong><span>{typed.length} / {target.length}</span></div>
        <p id="typing-target" aria-label={prompt} lang={language}>
          {target.map((character, index) => {
            const status = index === typed.length ? "current" :
              index > typed.length ? "" : typed[index] === character ? "correct" : "wrong";
            return <span key={index} className={status} aria-hidden="true">{character}</span>;
          })}
          {typed.length > target.length && (
            <span className="wrong" aria-hidden="true">{typed.slice(target.length).join("")}</span>
          )}
        </p>
      </div>
      {showLineSource && (
        <p className="practice-credit">
          <span>{copy.sourceLabel}:</span>{" "}
          {lineCredit ? (
            <>
              <a
                href={lineCredit.url}
                target="_blank"
                rel="noreferrer"
                aria-label={copy.openSource(lineCredit.source)}
              >
                {lineCredit.source}
              </a>
              <span> · {lineCredit.author}</span>
            </>
          ) : copy.originalLineSource}
        </p>
      )}
      <div className="entry">
        <label htmlFor="typing-input">{copy.followAlong}</label>
        <TypingInput
          language={language}
          target={prompt}
          onInput={(input, at) => {
            setNotice("");
            onInput(input, at);
          }}
          onSubmit={submit}
          onSpaceSubmit={submit}
          onBack={onBack}
          onBlockedEdit={() => setNotice(copy.blockedPracticeInput)}
        />
      </div>
      <div className="practice-actions">
        <p className="keys" id="typing-hint">
          <kbd>Enter</kbd> {copy.submit}
          {" · "}<kbd>Space</kbd> {copy.spaceSubmitHint}
          {" "}<kbd>Esc</kbd> {backLabel ?? copy.menu}
        </p>
        <button type="button" className="button" onClick={() => submit()}>{copy.submit}</button>
      </div>
      <p className="notice" role="status">{notice}</p>
      <Scoreboard label={copy.currentScore} score={score} language={language} speedUnit={speedUnit} copy={copy} showSpeed={false} />
      {previous && (
        <section className="previous-score" aria-labelledby="previous-title">
          <h2 id="previous-title">{previousLabel ?? copy.previousSentence}</h2>
          <Scoreboard label={copy.previousScore} score={previous} language={language} speedUnit={speedUnit} copy={copy} />
          {onFinish && <button type="button" className="button secondary" onClick={onFinish}>{copy.finishPractice}</button>}
        </section>
      )}
    </section>
  );
}
