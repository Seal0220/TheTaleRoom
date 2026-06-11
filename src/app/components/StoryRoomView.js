"use client";

import { StoryIntroPanel } from "./storyRoom/components/StoryIntroPanel";
import { StoryReturnZone } from "./storyRoom/components/StoryReturnZone";
import { StoryStageOverlay } from "./storyRoom/components/StoryStageOverlay";
import { StoryStartZone } from "./storyRoom/components/StoryStartZone";
import { accentAuraClassNames } from "./storyRoom/helpers/storyRoomLabels";
import { useStoryRoomController } from "./storyRoom/hooks/useStoryRoomController";

export function StoryRoomView({ isVisible, onBack, story }) {
  if (!story) {
    return null;
  }

  return (
    <StoryRoomViewContent
      key={story.id}
      isVisible={isVisible}
      onBack={onBack}
      story={story}
    />
  );
}

function StoryRoomViewContent({ isVisible, onBack, story }) {
  const room = useStoryRoomController({ onBack, story });

  return (
    <section
      aria-hidden={!isVisible}
      aria-live="polite"
      className={`absolute inset-0 z-20 min-h-screen overflow-hidden transition-all duration-500 ease-in-out
        ${isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}
      onTouchEnd={room.handleStageTouchEnd}
      onTouchStart={room.handleStageTouchStart}
      onWheel={room.handleStageWheel}
      style={room.stageCssVars}
    >
      <StoryStartZone
        isActive={room.isStoryAreaActive}
        onKeyDown={room.handleStartKeyDown}
        onPointerEnter={() => room.setIsSwitchHovered(true)}
        onPointerLeave={() => room.setIsSwitchHovered(false)}
        onStart={room.handleStartStory}
      />

      <div
        aria-hidden="true"
        className={`fixed inset-0 
          bg-[radial-gradient(circle_at_28%_20%,rgba(255,231,170,0.14),transparent_28%),linear-gradient(180deg,rgba(5,7,19,0.24),rgba(5,7,19,0.88))] 
          before:absolute  before:top-[-35vh] before:h-[82vh] before:bg-linear-to-b before:blur-3xl before:content-['']
          ${accentAuraClassNames[story.accent]}`}
      />

      <div
        className={`absolute inset-0 z-10 overflow-y-auto transition-all duration-500 ease-in-out 
          ${room.isStoryAreaActive ? "pointer-events-none opacity-0 blur-sm" : "pointer-events-auto opacity-100 blur-0"}`}
      >
        <div className="relative flex min-h-screen min-w-0 flex-col justify-start px-8 py-8 md:justify-center md:px-20 lg:h-full lg:min-h-0 lg:px-0 lg:py-0">
          <div className="mx-auto w-full max-w-3xl xl:max-w-6xl">
            <StoryIntroPanel
              isSwitchHovered={room.isSwitchHovered}
              onBack={onBack}
              onStart={room.handleStartStory}
              story={story}
              storyError={!room.hasActiveStory ? room.storyError : ""}
            />
          </div>
        </div>
      </div>

      <StoryReturnZone
        isActive={room.isStoryAreaActive}
        onBack={onBack}
        onKeyDown={room.handleReturnKeyDown}
        onPointerEnter={() => room.setIsReturnHovered(true)}
        onPointerLeave={() => room.setIsReturnHovered(false)}
      />

      <StoryStageOverlay
        activeStageIndex={room.activeStageIndex}
        activeStoryStage={room.activeStoryStage}
        draftInput={room.draftInput}
        isActive={room.isStoryAreaActive}
        isTurnLoading={room.isTurnLoading}
        onBack={onBack}
        onDraftInputChange={room.setDraftInput}
        onReturnKeyDown={room.handleReturnKeyDown}
        onSubmit={room.handleStorySubmit}
        phaseNames={room.phaseNames}
        progressPercent={room.progressPercent}
        stageCount={room.stageCount}
        stageNumbers={room.stageNumbers}
        stageTotalNumber={room.stageTotalNumber}
        story={story}
        storyCheckpoints={room.storyCheckpoints}
        storyError={room.storyError}
        storyStages={room.storyStages}
      />
    </section>
  );
}
