import { getDepthStageStyle } from "../helpers/storyRoomMotion";
import { StoryCheckpointPanel } from "./StoryCheckpointPanel";
import { StoryStageHeader } from "./StoryStageHeader";
import { StoryStageProgress } from "./StoryStageProgress";

export function StoryStageOverlay({
  activeStageIndex,
  activeStoryStage,
  draftInput,
  isActive,
  isTurnLoading,
  onBack,
  onDraftInputChange,
  onReturnKeyDown,
  onSubmit,
  phaseNames,
  progressPercent,
  stageCount,
  stageNumbers,
  stageTotalNumber,
  story,
  storyCheckpoints,
  storyError,
  storyStages,
}) {
  return (
    <div
      className={`absolute inset-0 z-20 overflow-y-auto overflow-x-hidden transition-opacity duration-500 ease-in-out
        ${isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      data-story-stage-scroll
    >
      <div className="relative flex min-h-screen min-w-0 flex-col justify-start px-8 py-8 md:justify-center md:px-20 lg:pl-60 lg:pr-20">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl grid-rows-[auto_minmax(min-content,1fr)_auto] gap-8 lg:min-h-[clamp(38rem,calc(100svh-4rem),52rem)] lg:gap-10">
          {stageCount > 0 && (
            <StoryStageHeader
              activeStageIndex={activeStageIndex}
              activeStoryStage={activeStoryStage}
              onBack={onBack}
              onBackKeyDown={onReturnKeyDown}
              phaseNames={phaseNames}
              stageNumbers={stageNumbers}
              story={story}
            />
          )}


          <div className="flex min-w-0">
            {storyStages.map((stageEntry, index) => (
              <section
                aria-hidden={index !== activeStageIndex}
                className={`${index === activeStageIndex ? "grid" : "hidden"} min-w-0 flex-1 items-start transition-all duration-900 ease-in-out`}
                key={stageEntry.key}
                style={getDepthStageStyle(index - activeStageIndex)}
              >
                <StoryCheckpointPanel
                  draftInput={draftInput}
                  isCurrent={stageEntry.checkpointIndex === storyCheckpoints.length - 1}
                  isTurnLoading={isTurnLoading}
                  onDraftInputChange={onDraftInputChange}
                  onSubmit={onSubmit}
                  stageIndex={stageEntry.checkpointIndex}
                  story={story}
                  storyError={
                    stageEntry.checkpointIndex === storyCheckpoints.length - 1
                      ? storyError
                      : ""
                  }
                  storyState={stageEntry.storyState}
                  submittedInput={stageEntry.submittedInput}
                />
              </section>
            ))}
          </div>


          {stageCount > 0 && (
            <StoryStageProgress
              activeStageIndex={activeStageIndex}
              progressPercent={progressPercent}
              stageCount={stageCount}
              stageNumbers={stageNumbers}
              stageTotalNumber={stageTotalNumber}
              storyStages={storyStages}
            />
          )}
        </div>
      </div>
    </div>
  );
}
