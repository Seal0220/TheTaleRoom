"use client";

import { BookOpen, LoaderCircle, Send } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { postJson } from "@/lib/httpJson";

const accentAuraClassNames = {
  rose: "from-[#f4a8b8]/22 via-[#cf6f93]/10 to-transparent",
  violet: "from-[#8d63ff]/24 via-[#44b7d7]/10 to-transparent",
  gold: "from-[#f4c76b]/24 via-[#7da083]/10 to-transparent",
  umber: "from-[#b88754]/24 via-[#7d8aa0]/10 to-transparent",
};

const emotionLabels = {
  neglect: "被忽略",
  hope: "希望",
  recognition: "被認出",
  confusion: "迷惘",
  identity: "自我",
  curiosity: "好奇",
  loneliness: "孤單",
  care: "在乎",
  growth: "成長",
  pressure: "壓力",
  truth: "真相",
  courage: "勇氣",
};

const phaseLabels = {
  opening: "開場",
  first_conflict: "初始衝突",
  projection: "情緒投射",
  turning_point: "轉折點",
  return: "導回主線",
  resolution: "情緒整理",
  ending: "結局",
};

export function StoryRoomView({ isVisible, onBack, story }) {
  if (!story) {
    return null;
  }

  return (
    <StoryRoomViewContent
      key={`${story.id}-${isVisible ? "visible" : "hidden"}`}
      isVisible={isVisible}
      onBack={onBack}
      story={story}
    />
  );
}

function StoryRoomViewContent({ isVisible, onBack, story }) {
  const wheelLockRef = useRef(false);
  const [isReturnHovered, setIsReturnHovered] = useState(false);
  const [isSwitchHovered, setIsSwitchHovered] = useState(false);
  const [storyError, setStoryError] = useState("");
  const [storyCheckpoints, setStoryCheckpoints] = useState([]);
  const [draftInput, setDraftInput] = useState("");
  const [isTurnLoading, setIsTurnLoading] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const hasBaseStoryDocument = Boolean(story.baseStoryDocument);
  const latestStoryState = storyCheckpoints[storyCheckpoints.length - 1] ?? null;
  const hasActiveStory = storyCheckpoints.length > 0;
  const isStoryAreaActive = isTurnLoading || hasActiveStory;
  const storyStages = [
    ...storyCheckpoints.map((checkpoint, index) => ({
      checkpointIndex: index,
      key: `${checkpoint.session_id}-${checkpoint.turn_index ?? index}`,
      storyState: checkpoint,
    })),
    ...(isTurnLoading
      ? [
        {
          checkpointIndex: storyCheckpoints.length,
          key: "loading-story-stage",
          storyState: null,
        },
      ]
      : []),
  ];
  const stageCount = storyStages.length;
  const activeStoryStage = storyStages[activeStageIndex] ?? storyStages[0] ?? null;
  const phaseNames = storyStages.map(({ storyState }) =>
    storyState ? phaseLabels[storyState.phase] ?? storyState.phase : "讀取中",
  );
  const stageNumbers = storyStages.map((_, index) => `${index + 1}`);
  const stageGutter = "clamp(1rem, 3vw, 3rem)";
  const stageOffset = "clamp(5.5rem, 28vw, 25rem)";
  const stageHoverShift = isReturnHovered
    ? "clamp(1.25rem, 2vw, 2rem)"
    : "0rem";
  const stageWidth =
    "calc(100vw - var(--stage-offset) - var(--stage-gutter) - var(--stage-gutter))";
  const progressPercent = stageCount > 1
    ? (activeStageIndex / (stageCount - 1)) * 100
    : 100;

  async function requestStoryTurn(mode, userInput = "") {
    if (isTurnLoading || !story || (mode === "init_story" && hasActiveStory)) {
      return;
    }

    if (!hasBaseStoryDocument) {
      setStoryError("這個故事還沒有建立基底文本，暫時不能開始。");
      return;
    }

    setIsTurnLoading(true);
    setStoryError("");
    setActiveStageIndex(storyCheckpoints.length);

    try {
      const payload = await postJson("/api/story/turn", {
        mode,
        previousState: mode === "continue_story" ? latestStoryState : null,
        sessionId: latestStoryState?.session_id ?? "",
        storyId: story.id,
        userInput,
      });

      setStoryCheckpoints((currentCheckpoints) => [...currentCheckpoints, payload.state]);
      setDraftInput("");
      setActiveStageIndex(storyCheckpoints.length);
    } catch (error) {
      setStoryError(error.message ?? "故事暫時無法開始。");
      setActiveStageIndex(storyCheckpoints.length > 0 ? storyCheckpoints.length - 1 : 0);
    } finally {
      setIsTurnLoading(false);
    }
  }

  function handleStartStory() {
    requestStoryTurn("init_story");
  }

  function handleSwitchKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStartStory();
    }
  }

  function handleReturnKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onBack();
    }
  }

  function handleStorySubmit(event) {
    event.preventDefault();

    if (!latestStoryState || latestStoryState.is_finished) {
      return;
    }

    requestStoryTurn("continue_story", draftInput);
  }

  function handleStageWheel(event) {
    if (!isStoryAreaActive || stageCount === 0) {
      return;
    }

    event.preventDefault();

    if (wheelLockRef.current) {
      return;
    }

    const wheelDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

    if (Math.abs(wheelDelta) < 18) {
      return;
    }

    wheelLockRef.current = true;
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 760);

    setActiveStageIndex((currentIndex) => {
      const nextIndex = wheelDelta > 0 ? currentIndex + 1 : currentIndex - 1;

      return Math.min(stageCount - 1, Math.max(0, nextIndex));
    });
  }

  return (
    <section
      aria-hidden={!isVisible}
      aria-live="polite"
      className={`absolute inset-0 z-20 min-h-screen overflow-hidden transition-all duration-500 ease-in-out
        ${isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}
      onWheel={handleStageWheel}
      style={{
        "--stage-gutter": stageGutter,
        "--stage-hover-shift": stageHoverShift,
        "--stage-offset": stageOffset,
        "--stage-width": stageWidth,
      }}
    >
      <div
        aria-label="開始故事"
        onClick={handleStartStory}
        onKeyDown={handleSwitchKeyDown}
        onPointerEnter={() => setIsSwitchHovered(true)}
        onPointerLeave={() => setIsSwitchHovered(false)}
        role="button"
        tabIndex={0}
        className={`group/switch absolute top-0 right-0 z-30 grid h-full w-160 cursor-pointer items-center justify-start overflow-hidden bg-linear-to-l from-[#f4c76b]/34 to-transparent pl-50 transition-all duration-700 ease-in-out
          before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-l before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:transition-opacity before:duration-700 before:ease-in-out before:content-['']
          ${isSwitchHovered ? "before:opacity-100" : "before:opacity-0"}
          ${isStoryAreaActive ? "pointer-events-none translate-x-28 opacity-0" : "translate-x-0 opacity-100"}`}
      >
        <div className="relative z-10 mt-12 h-fit w-fit select-none text-left">
          <span className="inline-block tracking-[0.5em] transition-all duration-[850ms] ease-in-out group-hover/switch:tracking-[2em]">
            開始故事 &gt;
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,231,170,0.14),transparent_28%),linear-gradient(180deg,rgba(5,7,19,0.24),rgba(5,7,19,0.88))] before:absolute before:inset-x-[-20vw] before:top-[-35vh] before:h-[70vh] before:bg-linear-to-b before:blur-3xl before:content-['']
          ${accentAuraClassNames[story.accent]}`}
      />

      <div
        className={`absolute inset-0 z-10 flex h-full w-full items-center px-5 py-10 transition-all duration-500 ease-in-out sm:px-8 lg:px-12
          ${isStoryAreaActive ? "pointer-events-none opacity-0 blur-sm" : "pointer-events-auto opacity-100 blur-0"}`}
      >
        <div className="ml-auto mr-160 w-full max-w-6xl">
          <StoryIntroPanel
            isSwitchHovered={isSwitchHovered}
            onBack={onBack}
            story={story}
            storyError={!hasActiveStory ? storyError : ""}
          />
        </div>
      </div>

      <div
        aria-label="返回入口"
        className={`group/return absolute top-0 left-0 z-30 grid h-full w-[clamp(8rem,22vw,40rem)] cursor-pointer items-center justify-end overflow-hidden bg-linear-to-r from-[#f4c76b]/34 to-transparent pr-[clamp(1.5rem,6vw,12.5rem)] transition-opacity duration-500 ease-in-out before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-r before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:opacity-0 before:transition-opacity before:duration-700 before:ease-in-out before:content-[''] hover:before:opacity-100
          ${isStoryAreaActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onBack}
        onKeyDown={handleReturnKeyDown}
        onPointerEnter={() => setIsReturnHovered(true)}
        onPointerLeave={() => setIsReturnHovered(false)}
        role="button"
        tabIndex={0}
      >
        <div className="relative z-10 mt-12 h-fit w-fit select-none text-right">
          <span className="inline-block text-xs tracking-[0.32em] transition-all duration-[850ms] ease-in-out group-hover/return:tracking-[0.8em] sm:text-sm sm:tracking-[0.5em] sm:group-hover/return:tracking-[1.4em] xl:group-hover/return:tracking-[2em]">
            &lt;返回入口
          </span>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-20 h-full w-full overflow-hidden transition-opacity duration-500 ease-in-out
          ${isStoryAreaActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className="relative h-full"
          style={{ marginLeft: "var(--stage-offset)" }}
        >
          {stageCount > 0 && (
            <div
              className="pointer-events-none absolute top-[clamp(6.5rem,24vh,14rem)] z-30 grid"
              style={{
                left: "var(--stage-gutter)",
                width: "var(--stage-width)",
              }}
            >
              <div
                className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#f6d797] sm:text-sm sm:tracking-[0.18em]"
                style={getHoverShiftStyle(560)}
              >
                {activeStoryStage?.storyState ? (
                  <BookOpen className="h-4 w-4" />
                ) : (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                <span>{story.displayNarrator ?? story.narrator} ·</span>
                <StageHeaderText
                  activeStageIndex={activeStageIndex}
                  items={phaseNames}
                />
                <span className="inline-flex items-center text-[#f8e8c4]/42">
                  <span>階段&nbsp;</span>
                  <StageHeaderText
                    activeStageIndex={activeStageIndex}
                    items={stageNumbers}
                  />
                </span>
              </div>
            </div>
          )}

          {storyStages.map((stageEntry, index) => (
            <section
              aria-hidden={index !== activeStageIndex}
              className="absolute top-[clamp(7.5rem,20vh,13rem)] grid items-center transition-all duration-900 ease-in-out"
              key={stageEntry.key}
              style={{
                ...getDepthStageStyle(index - activeStageIndex),
                left: "var(--stage-gutter)",
                width: "var(--stage-width)",
              }}
            >
              <StoryCheckpointPanel
                draftInput={draftInput}
                isCurrent={stageEntry.checkpointIndex === storyCheckpoints.length - 1}
                isTurnLoading={isTurnLoading}
                onBack={onBack}
                onDraftInputChange={setDraftInput}
                onSubmit={handleStorySubmit}
                storyError={stageEntry.checkpointIndex === storyCheckpoints.length - 1 ? storyError : ""}
                storyState={stageEntry.storyState}
              />
            </section>
          ))}
        </div>

        {stageCount > 0 && (
          <div
            className="pointer-events-none absolute bottom-[clamp(1.25rem,3vh,1.75rem)] z-20"
            style={{
              left: "calc(var(--stage-offset) + var(--stage-gutter))",
              right: "var(--stage-gutter)",
            }}
          >
            <div
              className="mx-auto grid w-full max-w-6xl gap-3"
              style={getHoverShiftStyle(1180)}
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#f6d797]/82">
                <span className="inline-flex items-center">
                  <span>階段&nbsp;</span>
                  <StageHeaderText
                    activeStageIndex={activeStageIndex}
                    items={stageNumbers}
                  />
                </span>
                <span>
                  {activeStageIndex + 1} / {stageCount}
                </span>
              </div>
              <div className="h-px w-full bg-[#f7d995]/20">
                <div
                  className="h-px bg-[#f7d995] transition-[width] duration-700 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between">
                {storyStages.map((stageEntry, index) => (
                  <span
                    className={`h-2 w-2 rounded-full border border-[#f7d995]/50 transition-all duration-500
                      ${index <= activeStageIndex ? "bg-[#f7d995]" : "bg-[#080b14]/70"}`}
                    key={`progress-${stageEntry.key}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StoryIntroPanel({ isSwitchHovered, onBack, story, storyError }) {
  const emotionTags = story.emotions.map((emotion) => emotionLabels[emotion] ?? emotion);

  return (
    <div className="grid w-full shrink-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
      <div className={`grid gap-8 transition duration-800 ease-in-out ${isSwitchHovered ? "-translate-x-12" : ""}`}>
        <Button
          arrowL
          onClick={onBack}
        >
          返回入口
        </Button>

        <div className="grid max-w-3xl gap-5">
          <div className="flex items-center gap-3 text-sm font-medium tracking-[0.18em] text-[#f6d797]">
            <BookOpen className="h-4 w-4" />
            <span>{story.displayNarrator ?? story.narrator}</span>
          </div>

          <h2 className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl">
            {story.displayTitle ?? story.title}
          </h2>

          <p className="max-w-2xl text-lg leading-9 text-[#f8e8c4]/86">
            {story.displayPrompt ?? story.prompt}
          </p>

          {storyError && (
            <p className="max-w-2xl rounded-md border border-[#f4a8b8]/30 bg-[#2b111d]/48 px-4 py-3 text-sm leading-7 text-[#ffd9df]">
              {storyError}
            </p>
          )}
        </div>
      </div>

      <aside
        className={`grid gap-5 border-l border-[#f7d995]/22 text-[#f8e8c4]/82 transition duration-600 ease-in-out
          ${isSwitchHovered ? "-translate-x-20" : ""}`}
      >
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
            體驗核心
          </p>
          <p className="text-sm leading-7">
            {story.displayDescription ?? story.description}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
            <span>關鍵情緒</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function StageHeaderText({ activeStageIndex, className = "", items }) {
  const longestItem = items.reduce(
    (currentLongest, item) =>
      item.length > currentLongest.length ? item : currentLongest,
    "",
  );

  return (
    <span className={`relative inline-grid min-w-0 ${className}`}>
      <span className="invisible col-start-1 row-start-1">
        {longestItem}
      </span>
      {items.map((item, index) => (
        <span
          className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out
            ${index === activeStageIndex ? "translate-y-0 opacity-100 blur-0" : index < activeStageIndex ? "-translate-y-2 opacity-0 blur-[2px]" : "translate-y-2 opacity-0 blur-[2px]"}`}
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

function getHoverShiftStyle(duration) {
  return {
    transform: "translate3d(var(--stage-hover-shift), 0, 0)",
    transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: "transform",
  };
}

function getDepthStageStyle(offset) {
  if (offset === 0) {
    return {
      filter: "blur(0px)",
      opacity: 1,
      pointerEvents: "auto",
      transform: "translate3d(0, 0, 0) scale(1)",
      zIndex: 3,
    };
  }

  if (offset < 0) {
    return {
      filter: "blur(8px)",
      opacity: 0,
      pointerEvents: "none",
      transform: "translate3d(0, 0, -520px) scale(0.84)",
      zIndex: 1,
    };
  }

  return {
    filter: "blur(10px)",
    opacity: 0,
    pointerEvents: "none",
    transform: "translate3d(0, 0, 420px) scale(1.12)",
    zIndex: 2,
  };
}

function StoryCheckpointPanel({
  draftInput,
  isCurrent,
  isTurnLoading,
  onBack,
  onDraftInputChange,
  onSubmit,
  storyError,
  storyState,
}) {
  const scene = storyState?.scene;
  const showStoryInput = Boolean(
    isCurrent && storyState?.frontend_actions?.show_input_box && !storyState?.is_finished,
  );
  const showEndButton = Boolean(isCurrent && storyState?.frontend_actions?.show_continue_button);
  const symbolicObjects = scene?.symbolic_objects ?? ["基底文本", "故事場景", "選擇點"];

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
      <div className="grid gap-8">
        <div className="h-[clamp(4rem,10vh,6.5rem)]" />

        <div className="grid max-w-3xl gap-5">
          <h2
            className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl"
            style={getHoverShiftStyle(660)}
          >
            {scene?.title ?? "故事正在展開"}
          </h2>

          <p
            className="max-w-2xl text-lg leading-9 text-[#f8e8c4]/86"
            style={getHoverShiftStyle(760)}
          >
            {scene?.narration ?? "說書人正在讀取基底文本，將第一個場景慢慢鋪開。"}
          </p>

          {storyState?.choice_point?.prompt && (
            <div
              className="grid max-w-2xl gap-3 border-l border-[#f7d995]/30 pl-5"
              style={getHoverShiftStyle(860)}
            >
              <p className="text-base leading-8 text-[#ffe9b7]">
                {storyState.choice_point.prompt}
              </p>
              {storyState.choice_point.guidance && (
                <p className="text-sm leading-7 text-[#f8e8c4]/70">
                  {storyState.choice_point.guidance}
                </p>
              )}
            </div>
          )}

          {showStoryInput && (
            <form
              className="grid max-w-2xl gap-3"
              onSubmit={onSubmit}
              style={getHoverShiftStyle(960)}
            >
              <textarea
                className="min-h-28 resize-none rounded-md border border-[#f7d995]/28 bg-[#080b14]/62 px-4 py-3 text-base leading-7 text-[#fff3d0] outline-none transition duration-300 placeholder:text-[#f8e8c4]/34 focus:border-[#f7d995]/72 focus:bg-[#080b14]/82"
                disabled={isTurnLoading}
                onChange={(event) => onDraftInputChange(event.target.value)}
                placeholder="讓她做什麼、想什麼，或說出一句沒說出口的話..."
                value={draftInput}
              />
              <button
                className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-md border border-[#f7d995]/42 bg-[#110d14]/76 px-5 text-sm font-semibold text-[#ffe9b7] transition duration-500 ease-in-out hover:bg-tale-gold hover:text-[#130b12] disabled:cursor-wait disabled:opacity-70"
                disabled={isTurnLoading}
                type="submit"
              >
                {isTurnLoading ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                送出
              </button>
            </form>
          )}

          {showEndButton && (
            <div style={getHoverShiftStyle(960)}>
              <Button onClick={onBack}>
                回到入口
              </Button>
            </div>
          )}

          {storyError && (
            <p
              className="max-w-2xl rounded-md border border-[#f4a8b8]/30 bg-[#2b111d]/48 px-4 py-3 text-sm leading-7 text-[#ffd9df]"
              style={getHoverShiftStyle(960)}
            >
              {storyError}
            </p>
          )}
        </div>
      </div>

      <aside
        className="grid gap-5 border-t border-[#f7d995]/22 pt-5 text-[#f8e8c4]/82 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
        style={getHoverShiftStyle(1080)}
      >
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
            此刻場景
          </p>
          <p className="text-sm leading-7">
            {scene ? `${scene.location} · ${scene.emotional_tone}` : "正在建立第一個故事場景"}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
            <span>象徵物</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {symbolicObjects.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
