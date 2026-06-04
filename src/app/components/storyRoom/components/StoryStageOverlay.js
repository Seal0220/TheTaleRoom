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
  onDraftInputChange,
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
      className={`absolute inset-0 z-20 grid h-full w-full items-center overflow-hidden transition-opacity duration-500 ease-in-out
        ${isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        className="relative grid h-[min(84vh,58rem)] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(4rem,3vh,2rem)]"
        style={{ marginLeft: "var(--stage-offset)" }}
      >
        {stageCount > 0 && (
          <StoryStageHeader
            activeStageIndex={activeStageIndex}
            activeStoryStage={activeStoryStage}
            phaseNames={phaseNames}
            stageNumbers={stageNumbers}
            story={story}
          />
        )}

        <div
          className="relative min-h-0 overflow-visible"
          style={{
            paddingLeft: "var(--stage-gutter)",
            paddingRight: "var(--stage-gutter)",
          }}
        >
          {storyStages.map((stageEntry, index) => (
            <section
              aria-hidden={index !== activeStageIndex}
              className="absolute inset-0 grid items-center transition-all duration-900 ease-in-out"
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
  );
}
