import { storyCatalog } from "@/config/storyCatalog";
import { selectRecords } from "@/lib/database";

const seedRecords = storyCatalog.slice(0, 2).map((story, index) => ({
  id: `seed-${story.id}`,
  account_id: "prototype",
  feature: "story-room",
  title: `${story.title} reflection`,
  metadata: {
    story: story.title,
    narrator: story.narrator,
    emotion: story.emotions[index],
  },
  input: {
    storyId: story.id,
  },
  result: {
    summary: story.prompt,
  },
  score: null,
  created_at: new Date(Date.UTC(2026, 5, 3, 12 + index)).toISOString(),
  updated_at: new Date(Date.UTC(2026, 5, 3, 12 + index)).toISOString(),
}));

export function listStoryRecords() {
  return [...selectRecords(), ...seedRecords];
}
