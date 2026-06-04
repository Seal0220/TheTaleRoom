import { notFound } from "next/navigation";
import { HomeExperience } from "../../components/HomeExperience";
import { getStoryByRouteName } from "@/config/storyCatalog";

export default async function StoryPage({ params }) {
  const routeParams = await params;
  const storyName = routeParams.StoryName ?? routeParams.storyName;
  const story = getStoryByRouteName(storyName);

  if (!story) {
    notFound();
  }

  return <HomeExperience initialStoryId={story.id} />;
}
