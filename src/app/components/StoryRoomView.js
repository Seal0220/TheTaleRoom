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
        className={`absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,231,170,0.14),transparent_28%),linear-gradient(180deg,rgba(5,7,19,0.24),rgba(5,7,19,0.88))] before:absolute before:inset-x-[-20vw] before:top-[-35vh] before:h-[70vh] before:bg-linear-to-b before:blur-3xl before:content-['']
          ${accentAuraClassNames[story.accent]}`}
      />

      <div
        className={`absolute inset-0 z-10 flex h-full w-full items-center px-5 py-24 transition-all duration-500 ease-in-out sm:px-8 md:pr-4 xl:pr-20 md:py-10 md:pl-16 lg:pl-18 xl:pl-32
          ${room.isStoryAreaActive ? "pointer-events-none opacity-0 blur-sm" : "pointer-events-auto opacity-100 blur-0"}`}
      >
        <div className="mx-auto w-full max-w-6xl md:ml-auto md:mr-[clamp(8rem,22vw,30rem)]">
          <StoryIntroPanel
            isSwitchHovered={room.isSwitchHovered}
            onBack={onBack}
            story={story}
            storyError={!room.hasActiveStory ? room.storyError : ""}
          />
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
        onDraftInputChange={room.setDraftInput}
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
