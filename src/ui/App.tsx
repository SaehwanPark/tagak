import { Suspense, lazy, useEffect, useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import {
  challengeEntry,
  completionTime,
  gamesEntry,
  settingsEntry,
  veniceEntry,
  usePracticeState,
} from "../app/usePractice";
import { useAppPreferences } from "../app/useAppPreferences";
import { useHistory } from "../app/useHistory";
import { useTextSize } from "../app/useTextSize";
import { useColorTheme } from "../app/useColorTheme";
import { usePracticeFont } from "../app/usePracticeFont";
import { useScreenCapture } from "../app/useScreenCapture";
import { quitDesktopApp } from "../platform/appLifecycle";
import { activities } from "../content/library";
import type { Activity, Language } from "../content/lessons";
import { longPassageEntry, passagesFor, shortPassageEntry } from "../content/passages";
import type { PassageActivity } from "../content/passages";
import { interfaceText } from "../content/interfaceText";
import { submissionEndsBundle } from "../domain/passagePractice";
import { calculateLiveAccuracy, hasReachedEnd } from "../domain/typing";
import { comparableRecord } from "../domain/history";
import { defaultColorTheme, defaultSize } from "../storage/settingsStorage";
import { ActivityMenu } from "./ActivityMenu";
import { PassageView } from "./PassageView";
import { ChallengeView } from "./ChallengeView";
import { DisplaySettings } from "./DisplaySettings";
import { HistoryView } from "./HistoryView";
import { PracticeView } from "./PracticeView";
import { ResultView } from "./ResultView";
import { ScreenCaptureControl } from "./ScreenCaptureControl";
import { playCompletionTone, playHighScoreTone } from "./completionSound";
import { createRunSeed } from "./randomSeed";
import { contentState, useScreenFocus } from "./useScreenFocus";

const VeniceView = lazy(() => import("./VeniceView").then(({ VeniceView: view }) => ({ default: view })));
const DataTransferView = lazy(() => import("./DataTransferView").then(({ DataTransferView: view }) => ({ default: view })));

function shouldPlayForCurrentSubmission(state: ReturnType<typeof usePracticeState>["state"], input?: string): boolean {
  if (state.screen === "practice") return hasReachedEnd(state.lesson.text, input ?? state.session.input);
  if (state.screen === "passage") return submissionEndsBundle(state.activity.lines, state.session, input);
  return false;
}

function activityLanguage(activity: Activity | PassageActivity): Language {
  if (activity.kind === "passage") return activity.language;
  return activity.lessons[0]?.language ?? "ko";
}

export function App() {
  const practice = usePracticeState();
  const { state, pending, pendingSession, latest, dispatch, acknowledge, acknowledgeSession } = practice;
  const currentScreen = contentState(state);
  const { shell, screenContent, captureSettingsOrigin } = useScreenFocus(state);
  const appPreferences = useAppPreferences();
  const {
    interfaceLanguage,
    practiceLanguage,
    completionSound,
    typingSpeedUnits,
    linePracticeSessionLength,
  } = appPreferences.preferences;
  const copy = interfaceText(interfaceLanguage);
  const history = useHistory(pending, pendingSession, acknowledge, acknowledgeSession);
  const textSize = useTextSize();
  const colorTheme = useColorTheme();
  const practiceFont = usePracticeFont(practiceLanguage);
  const screenCapture = useScreenCapture(shell);
  const desktopApp = isTauri();
  const settingsReturnScreen = state.screen === "settings" ? state.returnState.screen : null;
  const practiceLanguageLocked = settingsReturnScreen === "practice" || settingsReturnScreen === "passage" ||
    settingsReturnScreen === "challenge" ||
    settingsReturnScreen === "venice" || settingsReturnScreen === "result";
  const settingsNotice = [appPreferences.notice, textSize.notice, colorTheme.notice, practiceFont.notice]
    .filter(Boolean).join(" ");
  const back = () => currentScreen.screen === "practice" || currentScreen.screen === "passage"
    ? dispatch({ type: "return-to-menu", sessionId: crypto.randomUUID(), completedAt: Date.now() })
    : dispatch({ type: "return-to-menu" });
  const openSettings = () => {
    captureSettingsOrigin();
    dispatch({ type: "open-settings" });
  };
  const closeSettings = () => dispatch({ type: "close-settings" });
  const onInput = (input: string, at: number) => dispatch({ type: "input-changed", input, at });
  const onSubmit = (at: number, input?: string) => {
    const endsPracticeSession = currentScreen.screen === "practice"
      ? currentScreen.completedLineScores.length + 1 >= currentScreen.lineSessionLength &&
        hasReachedEnd(currentScreen.lesson.text, input ?? currentScreen.session.input)
      : currentScreen.screen === "passage"
        ? currentScreen.session.lineIndex + 1 === currentScreen.activity.lines.length &&
          submissionEndsBundle(currentScreen.activity.lines, currentScreen.session, input)
        : false;
    if (completionSound && !endsPracticeSession && shouldPlayForCurrentSubmission(currentScreen, input)) playCompletionTone();
    dispatch({ type: "submit", ...(input === undefined ? {} : { input }), ...completionTime(at) });
  };
  const notifyCompletion = () => { if (completionSound) playCompletionTone(); };
  const lastPracticeSessionTone = useRef<string | null>(null);

  useEffect(() => {
    if (currentScreen.screen !== "result" || !currentScreen.sessionRecord) return;
    const saved = history.latestSessionSave;
    if (!saved || saved.id !== currentScreen.sessionRecord.id || (saved.ok && saved.duplicate) ||
        saved.completion !== "completed" || lastPracticeSessionTone.current === saved.id) return;
    lastPracticeSessionTone.current = saved.id;
    if (!completionSound) return;
    if (saved.ok && saved.decision?.status === "new-record") playHighScoreTone();
    else playCompletionTone();
  }, [completionSound, currentScreen, history.latestSessionSave]);

  useEffect(() => {
    document.documentElement.lang = interfaceLanguage;
    document.documentElement.dataset.practiceLanguage = practiceLanguage;
  }, [interfaceLanguage, practiceLanguage]);

  const languageActivities = activities.filter((activity) => {
    return activity.lessons.some((lesson) => lesson.language === practiceLanguage);
  });
  const mainActivities = [
    ...languageActivities,
    { ...shortPassageEntry },
    { ...longPassageEntry },
    gamesEntry,
    settingsEntry,
  ].map((activity) => ({
    ...activity,
    label: copy.activityLabel(activity.id, activity.label),
  }));
  const gameActivities = [challengeEntry, veniceEntry].map((activity) => ({
    ...activity,
    label: copy.activityLabel(activity.id, activity.label),
  }));
  const libraryPassages = currentScreen.screen === "library"
    ? passagesFor(practiceLanguage, currentScreen.length)
    : [];
  const passageList = libraryPassages.map((passage) => ({
    ...passage,
    label: copy.activityLabel(passage.id, passage.label),
    detail: `${copy.genreLabel(passage.genre)} · ${passage.characterCount}${copy.charactersSuffix}`,
    creditLabel: passage.credit
      ? `${passage.credit.author} · ${passage.credit.source} · ${copy.licenseLabel(passage.license)}`
      : "",
  }));

  const historyMessages: Readonly<Record<string, string>> = {
    "history-save-failed": copy.historySaveFailed,
    "session-save-failed": copy.sessionSaveFailed,
    "history-clear-failed": copy.historyClearFailed,
    "history-cleared": copy.historyCleared,
    "high-scores-cleared": copy.highScoresCleared,
    "history-read-failed": copy.historyReadFailed,
  };
  const historyMessage = historyMessages[history.notice] ?? "";
  const sessionSave = currentScreen.screen === "result" && currentScreen.sessionRecord &&
    history.latestSessionSave?.id === currentScreen.sessionRecord.id
    ? history.latestSessionSave
    : null;
  const sessionFailureShownInResult = currentScreen.screen === "result" &&
    sessionSave?.ok === false && history.notice === "session-save-failed";

  return (
    <main
      ref={shell}
      className="shell"
      data-text-size={textSize.size}
      onKeyDown={(event) => {
        if (state.screen !== "menu" || !desktopApp || event.key !== "Escape" || event.defaultPrevented ||
          event.repeat || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
        event.preventDefault();
        quitDesktopApp();
      }}
    >
      <header className="masthead">
        <span className="brand"><span aria-hidden="true">▰</span> {copy.brand}</span>
        <div className="masthead-actions">
          {currentScreen.screen !== "menu" && state.screen !== "settings" && (
            <button
              type="button"
              className="button secondary settings-shortcut"
              onClick={openSettings}
            >
              {copy.settings}
            </button>
          )}
          <ScreenCaptureControl
            isSaving={screenCapture.isSaving}
            status={screenCapture.status}
            shortcutLabel={screenCapture.shortcutLabel}
            copy={copy}
            onSave={() => { void screenCapture.save(); }}
          />
        </div>
      </header>

      <div ref={screenContent} className="screen-underlay" hidden={state.screen === "settings"}>
      {currentScreen.screen === "menu" && (
        <ActivityMenu
          title={copy.typingPractice}
          activities={mainActivities}
          selected={currentScreen.selected}
          home
          showQuitHint={desktopApp}
          copy={copy}
          onStart={(activity) => {
            if (activity.kind === "short-library") dispatch({ type: "open-library", length: "short" });
            else if (activity.kind === "long-library") dispatch({ type: "open-library", length: "long" });
            else if (activity.kind === "games") dispatch({ type: "open-games" });
            else if (activity.kind === "settings") openSettings();
            else dispatch({ type: "start", activity, seed: createRunSeed(), lineSessionLength: linePracticeSessionLength });
          }}
        />
      )}

      {currentScreen.screen === "games" && (
        <ActivityMenu
          title={copy.games}
          activities={gameActivities}
          selected={currentScreen.selected}
          copy={copy}
          onStart={(activity) => {
            if (activity.kind === "challenge") dispatch({ type: "open-challenge" });
            else dispatch({ type: "open-venice" });
          }}
          onBack={back}
        />
      )}

      {currentScreen.screen === "challenge" && <ChallengeView onBack={back} copy={copy} onWordComplete={notifyCompletion} />}
      {currentScreen.screen === "venice" && (
        <Suspense fallback={<section className="screen" aria-busy="true" />}>
          <VeniceView
            onBack={back}
            copy={copy}
            interfaceLanguage={interfaceLanguage}
            soundEnabled={completionSound}
            settingsOpen={state.screen === "settings" && state.returnState.screen === "venice"}
          />
        </Suspense>
      )}

      {currentScreen.screen === "library" && (
        <ActivityMenu
          title={currentScreen.length === "short" ? copy.chooseShortPassage : copy.chooseLongPassage}
          activities={passageList}
          selected={currentScreen.selected}
          copy={copy}
          onStart={(activity) => dispatch({ type: "start-passage", activity })}
          onBack={back}
        />
      )}

      {currentScreen.screen === "practice" && (
        <PracticeView
          key={currentScreen.round}
          title={currentScreen.lesson.title}
          prompt={currentScreen.lesson.text}
          lineCredit={currentScreen.lesson.credit}
          showLineSource={currentScreen.lesson.mode === "line"}
          language={currentScreen.lesson.language}
          session={currentScreen.session}
          liveScore={() => calculateLiveAccuracy(
            currentScreen.lesson.text,
            currentScreen.session.input,
            currentScreen.lesson.language,
          )}
          previous={currentScreen.previous}
          {...(currentScreen.activity.kind === "line" ? {
            sessionProgress: copy.lineSessionProgress(currentScreen.completedLineScores.length + 1, currentScreen.lineSessionLength),
          } : {})}
          speedUnit={typingSpeedUnits[currentScreen.lesson.language]}
          copy={copy}
          onInput={onInput}
          onSubmit={onSubmit}
          onFinish={() => dispatch({ type: "finish", sessionId: crypto.randomUUID(), completedAt: Date.now() })}
          onBack={back}
        />
      )}

      {currentScreen.screen === "passage" && (
        <PassageView
          activity={currentScreen.activity}
          session={currentScreen.session}
          onInput={onInput}
          onSubmit={onSubmit}
          onBack={back}
          copy={copy}
          speedUnit={typingSpeedUnits[currentScreen.activity.language]}
        />
      )}

      {currentScreen.screen === "result" && (
        <ResultView
          title={currentScreen.lineSessionScores && currentScreen.activity.kind !== "passage" ? copy.lineSessionResult
            : currentScreen.activity.kind === "line" ? copy.previousSentence
              : copy.activityLabel(currentScreen.activity.id, currentScreen.activity.label)}
          progress={currentScreen.lineSessionScores && currentScreen.activity.kind !== "passage"
            ? copy.lineSessionCompleted(currentScreen.lineSessionScores.length)
            : undefined}
          {...(currentScreen.lineSessionScores ? { lineSessionScores: currentScreen.lineSessionScores } : {})}
          score={currentScreen.score}
          showSpeed
          language={activityLanguage(currentScreen.activity)}
          speedUnit={typingSpeedUnits[activityLanguage(currentScreen.activity)]}
          comparison={latest ? comparableRecord(latest, history.records)?.score : undefined}
          sessionRecord={currentScreen.sessionRecord}
          {...(sessionSave ? {
            sessionDecision: sessionSave.decision,
            sessionSaveFailed: !sessionSave.ok,
          } : {})}
          backLabel={currentScreen.activity.kind === "passage"
            ? currentScreen.activity.length === "short" ? copy.shortPassage : copy.longPassage
            : copy.menu}
          onRetry={() => {
            if (currentScreen.activity.kind !== "passage") {
              dispatch({ type: "retry-randomized", seed: createRunSeed() });
            } else {
              dispatch({ type: "retry" });
            }
          }}
          onBack={back}
          copy={copy}
        />
      )}

      </div>

      {historyMessage && !sessionFailureShownInResult && (state.screen !== "settings" || state.view === "history") && (
        <p className="storage-notice" role="status">{historyMessage}</p>
      )}

      {state.screen === "settings" && state.view === "menu" && (
        <DisplaySettings
          interfaceLanguage={interfaceLanguage}
          practiceLanguage={practiceLanguage}
          linePracticeSessionLength={linePracticeSessionLength}
          onInterfaceLanguageChange={(language) => { void appPreferences.change({ interfaceLanguage: language }); }}
          onPracticeLanguageChange={(language) => { void appPreferences.change({ practiceLanguage: language }); }}
          onLinePracticeSessionLengthChange={(length) => {
            void appPreferences.change({ linePracticeSessionLength: length });
          }}
          typingSpeedUnits={typingSpeedUnits}
          onTypingSpeedUnitChange={(language, unit) => {
            void appPreferences.change({
              typingSpeedUnits: { ...appPreferences.preferences.typingSpeedUnits, [language]: unit },
            });
          }}
          size={textSize.size}
          onSizeChange={textSize.change}
          theme={colorTheme.theme}
          onThemeChange={colorTheme.change}
          font={practiceFont.font}
          onFontChange={practiceFont.change}
          completionSound={completionSound}
          onCompletionSoundChange={(enabled) => { void appPreferences.change({ completionSound: enabled }); }}
          onOpenHistory={() => dispatch({ type: "open-settings-history" })}
          onOpenDataTransfer={() => dispatch({ type: "open-settings-data-transfer" })}
          onReset={() => {
            void Promise.all([
              appPreferences.reset(),
              textSize.change(defaultSize, true),
              colorTheme.change(defaultColorTheme, true),
              practiceFont.resetAll(),
            ]);
          }}
          onBack={closeSettings}
          backLabel={state.returnState.screen === "menu" ? copy.backToMenu : copy.back}
          practiceLanguageLocked={practiceLanguageLocked}
          initialFocusRow={state.focusRow}
          notice={settingsNotice}
          copy={copy}
        />
      )}

      {state.screen === "settings" && state.view === "history" && (
        <HistoryView
          records={history.records}
          sessions={history.sessions}
          highScores={history.highScores}
          onClear={history.reset}
          onClearHighScores={history.resetHighScores}
          onBack={() => dispatch({ type: "return-to-settings" })}
          copy={copy}
          interfaceLanguage={interfaceLanguage}
          typingSpeedUnits={typingSpeedUnits}
        />
      )}

      {state.screen === "settings" && state.view === "data-transfer" && (
        <Suspense fallback={<section className="screen" aria-busy="true" />}>
          <DataTransferView onBack={() => dispatch({ type: "return-to-settings" })} copy={copy} />
        </Suspense>
      )}

    </main>
  );
}
