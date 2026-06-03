export const storyCatalog = [
  {
    id: "cinderella",
    title: "Cinderella",
    narrator: "Glass Slipper",
    theme: "Being seen",
    prompt: "The ballroom waits for the part of you that has been overlooked.",
    description:
      "A room for exhaustion, invisibility, tenderness, and the first moment of recognition.",
    emotions: ["neglect", "hope", "recognition"],
    accent: "rose",
  },
  {
    id: "alice",
    title: "Alice's Dream Wonderland",
    narrator: "Cheshire Cat",
    theme: "Finding yourself",
    prompt: "The path bends where confusion begins to name itself.",
    description:
      "A room for uncertainty, identity, contradiction, and curious self-recognition.",
    emotions: ["confusion", "identity", "curiosity"],
    accent: "violet",
  },
  {
    id: "little-prince",
    title: "The Little Prince",
    narrator: "Fox",
    theme: "Learning attachment",
    prompt: "The sunset keeps a place for what you still care about.",
    description:
      "A room for loneliness, memory, attachment, goodbye, and quiet meaning.",
    emotions: ["loneliness", "care", "growth"],
    accent: "gold",
  },
  {
    id: "emperor",
    title: "The Emperor's New Clothes",
    narrator: "Tailor",
    theme: "Telling the truth",
    prompt: "The mirror asks what you have been carrying for everyone else.",
    description:
      "A room for performance, shame, social pressure, honesty, and courage.",
    emotions: ["pressure", "truth", "courage"],
    accent: "umber",
  },
];

export function getStoryById(storyId) {
  return storyCatalog.find((story) => story.id === storyId);
}
