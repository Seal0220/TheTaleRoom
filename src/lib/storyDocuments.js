import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStoryById } from "@/config/storyCatalog";

export async function readBaseStoryDocument(storyId) {
  const story = getStoryById(storyId);

  if (!story) {
    return {
      ok: false,
      status: 404,
      error: "Unknown story.",
    };
  }

  if (!story.baseStoryDocument) {
    return {
      ok: false,
      status: 404,
      error: "No base story document is configured for this story yet.",
    };
  }

  const documentPath = path.join(process.cwd(), "documents", story.baseStoryDocument);

  try {
    const text = await readFile(documentPath, "utf8");

    return {
      ok: true,
      story,
      document: {
        path: `documents/${story.baseStoryDocument}`,
        text,
      },
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        ok: false,
        status: 404,
        error: "Base story document was not found.",
      };
    }

    throw error;
  }
}
