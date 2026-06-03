export async function requestStoryCompletion({ prompt }) {
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "local-prototype",
      text: prompt,
    };
  }

  throw new Error("AI provider integration is not configured yet.");
}
