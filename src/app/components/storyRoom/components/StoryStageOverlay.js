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
      className={`inset-0 over z-20 grid w-auto overflow-y-auto overflow-x-hidden transition-opacity duration-500 ease-in-out lg:items-center lg:min-h-screen
        ${isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      data-story-stage-scroll
    >
      <div className="relative min-h-screen w-auto lg:min-h-fit bg-amber-600">
        <div className="m-8 md:mx-20 lg:ml-60 lg:mr-20 min-h-screen lg:h-[min(76vh,58rem)] lg:min-h-fit min-w-0 grid bg-red-600">
          {/* <div className="bg-red-600 w-60 mx-auto">123</div> */}

          <div className="mx-auto grid grid-rows-[auto_minmax(0,1fr)_auto] gap-8 lg:gap-[clamp(4rem,3vh,2rem)]">
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


            <div className="min-h-0 flex">
              {storyStages.map((stageEntry, index) => (
                <section
                  aria-hidden={index !== activeStageIndex}
                  className={`${index === activeStageIndex ? "grid" : "hidden lg:grid"} min-h-0 items-start transition-all duration-900 ease-in-out lg:items-center`}
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
    </div>
  );
}
