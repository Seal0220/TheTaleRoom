import { notFound } from "next/navigation";
import { HomeExperience } from "../../components/HomeExperience";
import { getStoryByRouteName } from "@/config/storyCatalog";

export default async function StoryPage({ params }) {
  const { StoryName } = await params;
  const story = getStoryByRouteName(StoryName);

  if (!story) {
    notFound();
  }

  return <HomeExperience initialStoryId={story.id} />;
}
