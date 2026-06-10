import { getHoverShiftStyle } from "../helpers/storyRoomMotion";
import { StageHeaderText } from "./StageHeaderText";

export function StoryStageProgress({
  activeStageIndex,
  progressPercent,
  stageCount,
  stageNumbers,
  stageTotalNumber,
  storyStages,
}) {
  return (
    <div className="pointer-events-none sticky bottom-0 z-40 lg:static lg:mt-0">
      <div
        className="grid w-full max-w-6xl gap-3"
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
          <span className="inline-flex items-center">
            <StageHeaderText
              activeStageIndex={activeStageIndex}
              items={stageNumbers}
            />
            <span>&nbsp;/&nbsp;</span>
            <span
              aria-label={stageTotalNumber}
              className="relative inline-grid min-w-[1ch]"
            >
              <span
                aria-hidden="true"
                className="story-inline-value col-start-1 row-start-1"
                key={stageTotalNumber}
              >
                {stageTotalNumber}
              </span>
            </span>
          </span>
        </div>
        <div className="h-px w-full bg-[#f7d995]/20">
          <div
            className="h-px bg-[#f7d995] transition-[width] duration-700 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="relative h-2">
          {storyStages.map((stageEntry, index) => {
            const nodeLeft = stageCount > 1
              ? (index / (stageCount - 1)) * 100
              : 0;

            return (
              <span
                className={`story-progress-node absolute top-0 ml-1 h-2 w-2 -translate-x-1/2 rounded-full border border-[#f7d995]/50 transition-[left,background-color,border-color,transform] duration-700 ease-in-out
                  ${index <= activeStageIndex ? "bg-[#f7d995]" : "bg-tale-ink/70"}`}
                key={`progress-${stageEntry.key}`}
                style={{
                  left: `${nodeLeft}%`,
                  transitionDelay: `${index * 70}ms`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
