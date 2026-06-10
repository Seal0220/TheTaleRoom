import { useRef, useState } from "react";
import { postJson } from "@/lib/httpJson";
import { buildInteractionHistory } from "../methods/buildInteractionHistory";
import { buildStoryStageLabels, buildStoryStages } from "../methods/buildStoryStages";
import { getNextStageIndex, getStoryWheelDelta } from "../methods/getStoryWheelDelta";

const stageGutter = "clamp(1rem, 3vw, 3rem)";
const stageOffset = "clamp(5.5rem, 28vw, 25rem)";
const stageWidth =
  "calc(100vw - var(--stage-offset) - var(--stage-gutter) - var(--stage-gutter))";
const storyTurnRequestOptions = {
  retries: 2,
  retryDelayMs: 1200,
  timeoutMs: 95000,
};

export function useStoryRoomController({ onBack, story }) {
  const wheelLockRef = useRef(false);
  const [isReturnHovered, setIsReturnHovered] = useState(false);
  const [isSwitchHovered, setIsSwitchHovered] = useState(false);
  const [storyError, setStoryError] = useState("");
  const [storyCheckpoints, setStoryCheckpoints] = useState([]);
  const [draftInput, setDraftInput] = useState("");
  const [pendingUserInput, setPendingUserInput] = useState("");
  const [isTurnLoading, setIsTurnLoading] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const hasBaseStoryDocument = Boolean(story.baseStoryDocument);
  const latestStoryState = storyCheckpoints[storyCheckpoints.length - 1] ?? null;
  const hasActiveStory = storyCheckpoints.length > 0;
  const isStoryAreaActive = isTurnLoading || hasActiveStory;
  const storyStages = buildStoryStages({
    isTurnLoading,
    pendingUserInput,
    storyCheckpoints,
  });
  const stageCount = storyStages.length;
  const activeStoryStage = storyStages[activeStageIndex] ?? storyStages[0] ?? null;
  const { phaseNames, stageNumbers } = buildStoryStageLabels(storyStages);
  const progressPercent = stageCount > 1
    ? (activeStageIndex / (stageCount - 1)) * 100
    : 100;
  const stageHoverShift = isReturnHovered
    ? "clamp(1.25rem, 2vw, 2rem)"
    : "0rem";

  async function requestStoryTurn(mode, userInput = "") {
    if (isTurnLoading || !story || (mode === "init_story" && hasActiveStory)) {
      return;
    }

    if (!hasBaseStoryDocument) {
      setStoryError("這個故事還沒有建立基底文本，暫時不能開始。");
      return;
    }

    const submittedInput = mode === "continue_story" ? userInput.trim() : "";

    if (submittedInput) {
      setStoryCheckpoints((currentCheckpoints) =>
        currentCheckpoints.map((checkpoint, index) =>
          index === currentCheckpoints.length - 1
            ? { ...checkpoint, submittedInput }
            : checkpoint,
        ),
      );
    }

    setIsTurnLoading(true);
    setPendingUserInput(submittedInput);
    setStoryError("");
    setActiveStageIndex(storyCheckpoints.length);

    try {
      const payload = await postJson(
        "/api/story/turn",
        {
          interactionHistory: buildInteractionHistory(storyCheckpoints),
          mode,
          previousState: mode === "continue_story" ? latestStoryState : null,
          sessionId: latestStoryState?.session_id ?? "",
          storyId: story.id,
          userInput,
        },
        storyTurnRequestOptions,
      );

      setStoryCheckpoints((currentCheckpoints) => [
        ...currentCheckpoints,
        {
          ...payload.state,
          submittedInput: "",
        },
      ]);
      setDraftInput("");
      setActiveStageIndex(storyCheckpoints.length);
    } catch (error) {
      setStoryError(getStoryTurnErrorMessage(error));
      setActiveStageIndex(storyCheckpoints.length > 0 ? storyCheckpoints.length - 1 : 0);
    } finally {
      setIsTurnLoading(false);
      setPendingUserInput("");
    }
  }

  function handleStartStory() {
    requestStoryTurn("init_story");
  }

  function handleStartKeyDown(event) {
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

    if (wheelLockRef.current) {
      return;
    }

    const wheelDelta = getStoryWheelDelta(event);

    if (!wheelDelta) {
      return;
    }

    const scrollElement = getStoryScrollElement(event.target);

    if (scrollElement && canScrollElement(scrollElement, wheelDelta)) {
      return;
    }

    event.preventDefault();

    wheelLockRef.current = true;
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 760);

    setActiveStageIndex((currentIndex) =>
      getNextStageIndex({ currentIndex, stageCount, wheelDelta }),
    );
  }

  return {
    activeStageIndex,
    activeStoryStage,
    draftInput,
    handleReturnKeyDown,
    handleStageWheel,
    handleStartKeyDown,
    handleStartStory,
    handleStorySubmit,
    hasActiveStory,
    isReturnHovered,
    isStoryAreaActive,
    isSwitchHovered,
    isTurnLoading,
    phaseNames,
    progressPercent,
    setDraftInput,
    setIsReturnHovered,
    setIsSwitchHovered,
    stageCount,
    stageCssVars: {
      "--stage-gutter": stageGutter,
      "--stage-hover-shift": stageHoverShift,
      "--stage-offset": stageOffset,
      "--stage-width": stageWidth,
    },
    stageNumbers,
    stageTotalNumber: `${stageCount}`,
    storyCheckpoints,
    storyError,
    storyStages,
  };
}

function getStoryTurnErrorMessage(error) {
  if (error?.status && error.status < 500) {
    return error.message ?? "故事暫時無法開始。";
  }

  return "說書人剛才在夜色裡多停了一會兒，仍沒能把下一頁帶回來。請再試一次；故事還在燈旁等你。";
}

function getStoryScrollElement(target) {
  if (!target || typeof target.closest !== "function") {
    return null;
  }

  return target.closest("[data-story-stage-scroll]");
}

function canScrollElement(element, wheelDelta) {
  const hasVerticalOverflow = element.scrollHeight > element.clientHeight + 1;

  if (!hasVerticalOverflow) {
    return false;
  }

  const canScrollUp = element.scrollTop > 0;
  const canScrollDown =
    element.scrollTop + element.clientHeight < element.scrollHeight - 1;

  return (wheelDelta < 0 && canScrollUp) || (wheelDelta > 0 && canScrollDown);
}
