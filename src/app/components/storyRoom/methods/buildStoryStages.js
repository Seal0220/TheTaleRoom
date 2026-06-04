import { phaseLabels } from "../helpers/storyRoomLabels";

export function buildStoryStages({
  isTurnLoading,
  pendingUserInput,
  storyCheckpoints,
}) {
  return [
    ...storyCheckpoints.map((checkpoint, index) => ({
      checkpointIndex: index,
      key: `${checkpoint.session_id}-${checkpoint.turn_index ?? index}`,
      storyState: checkpoint,
      submittedInput: checkpoint.submittedInput ?? "",
    })),
    ...(isTurnLoading
      ? [
        {
          checkpointIndex: storyCheckpoints.length,
          key: "loading-story-stage",
          storyState: null,
          submittedInput: pendingUserInput,
        },
      ]
      : []),
  ];
}

export function buildStoryStageLabels(storyStages) {
  return {
    phaseNames: storyStages.map(({ storyState }) =>
      storyState ? phaseLabels[storyState.phase] ?? storyState.phase : "讀取中",
    ),
    stageNumbers: storyStages.map((_, index) => `${index + 1}`),
  };
}
