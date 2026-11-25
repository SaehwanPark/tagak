import { useEffect, useRef } from "react";
import type { PassageActivity } from "../content/passages";
import { passageAccuracy } from "../domain/passagePractice";
import type { PassageSession } from "../domain/passagePractice";
import { passageLinesPerPage } from "../domain/textLayout";
import { PracticeView } from "./PracticeView";
import { handleScrollRegionKeyDown, revealWithinScrollRegion } from "./focusWithinScrollRegion";
import type { InterfaceText } from "../content/interfaceText";
import type { TypingSpeedUnit } from "../domain/typingSpeed";

type PassageViewProps = {
  activity: PassageActivity;
  session: PassageSession;
  onInput: (input: string, at: number) => void;
  onSubmit: (at: number, input?: string) => void;
  onBack: () => void;
  copy: InterfaceText;
  speedUnit: TypingSpeedUnit;
};

export function PassageView({ activity, session, onInput, onSubmit, onBack, copy, speedUnit }: PassageViewProps) {
  const index = session.lineIndex;
  const target = activity.lines[index];
  if (!target) return null;

  const pageIndex = Math.floor(index / passageLinesPerPage);
  const pageStart = pageIndex * passageLinesPerPage;
  const page = activity.lines.slice(pageStart, pageStart + passageLinesPerPage);
  const pageCount = Math.ceil(activity.lines.length / passageLinesPerPage);
  const backLabel = activity.length === "short" ? copy.shortPassage : copy.longPassage;
  const pageViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    revealWithinScrollRegion(pageViewport.current?.querySelector<HTMLElement>(".current"));
  }, [index]);

  return (
    <PracticeView
      key={index}
      title={activity.label}
      language={activity.language}
      prompt={target}
      session={session.line}
      liveScore={() => passageAccuracy(target, session, activity.language)}
      speedUnit={speedUnit}
      previous={session.lastBundle}
      previousLabel={copy.passageBundleScore}
      backLabel={backLabel}
      copy={copy}
      context={
        <div
          ref={pageViewport}
          className="passage-page"
          lang={activity.language}
          role="region"
          aria-label={copy.passagePage(pageIndex + 1, pageCount)}
          tabIndex={0}
          data-scroll-region
          onKeyDown={handleScrollRegionKeyDown}
        >
          <p className="passage-progress">
            <strong>{copy.passagePage(pageIndex + 1, pageCount)}</strong>
            <span>{copy.genreLabel(activity.genre)} · {activity.characterCount}{copy.charactersSuffix}</span>
          </p>
          <ol>
            {page.map((line, offset) => {
              const lineNumber = pageStart + offset;
              const status = lineNumber < index ? "done" : lineNumber === index ? "current" : "upcoming";
              return (
                <li key={lineNumber} className={status}>
                  <span aria-hidden="true">{lineNumber + 1}</span>
                  {line}
                </li>
              );
            })}
          </ol>
        </div>
      }
      onInput={onInput}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  );
}
