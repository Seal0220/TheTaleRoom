import { BookOpen, LoaderCircle } from "lucide-react";
import { getHoverShiftStyle } from "../helpers/storyRoomMotion";
import { StageHeaderText } from "./StageHeaderText";

export function StoryStageHeader({
  activeStageIndex,
  activeStoryStage,
  phaseNames,
  stageNumbers,
  story,
}) {
  return (
    <div
      className="pointer-events-none z-30 grid"
      style={{
        paddingLeft: "var(--stage-gutter)",
        paddingRight: "var(--stage-gutter)",
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
  );
}
