import { ArrowLeft, BookOpen, LoaderCircle } from "lucide-react";
import { getHoverShiftStyle } from "../helpers/storyRoomMotion";
import { StageHeaderText } from "./StageHeaderText";

export function StoryStageHeader({
  activeStageIndex,
  activeStoryStage,
  onBack,
  onBackKeyDown,
  phaseNames,
  stageNumbers,
  story,
}) {
  return (
    <div className="sticky top-0 z-40 grid w-full gap-3 py-4 before:pointer-events-none before:absolute before:-top-8 before:left-1/2 before:z-0 before:h-32 before:w-screen before:-translate-x-1/2 before:bg-linear-to-b before:from-[#151515]/78 before:via-[#151515]/42 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:-top-8 after:left-1/2 after:z-0 after:h-36 after:w-screen after:-translate-x-1/2 after:backdrop-blur-md after:[mask-image:linear-gradient(to_bottom,black_0%,black_48%,transparent_100%)] after:content-[''] md:flex md:items-center md:gap-5 lg:pointer-events-none lg:static lg:w-fit lg:gap-0 lg:py-0 lg:before:hidden lg:after:hidden">
      <button
        aria-label="返回入口"
        className="relative z-10 inline-flex h-9 w-fit items-center gap-2 rounded-md border border-[#f7d995]/34 bg-[#100b14]/62 px-3 -mx-1 mb-2 text-xs font-semibold tracking-[0.16em] text-[#ffe9b7] transition duration-300 hover:bg-tale-gold hover:text-[#130b12] md:mb-0 lg:hidden"
        onClick={onBack}
        onKeyDown={onBackKeyDown}
        type="button"
      >
        <ArrowLeft className="size-4" />
        返回入口
      </button>

      <div
        className="relative z-10 flex max-w-6xl flex-wrap items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#f6d797] sm:text-sm sm:tracking-[0.18em]"
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
