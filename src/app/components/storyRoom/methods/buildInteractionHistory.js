export function buildInteractionHistory(storyCheckpoints) {
  return storyCheckpoints
    .map((checkpoint, index) => ({
      emotionalMeaning: checkpoint.user_input_interpretation?.emotional_meaning ?? [],
      phase: checkpoint.phase ?? "",
      turnIndex: checkpoint.turn_index ?? index,
      userInput: checkpoint.submittedInput ?? "",
    }))
    .filter((entry) => entry.userInput.trim());
}
