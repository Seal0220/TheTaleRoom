const bazaarBaseUrl = "https://bazaarlink.ai/api/v1";
const defaultBazaarModel = "openai/gpt-4.1";

function getBazaarApiKey() {
  return process.env.BAZZAR_API_KEY ?? process.env.BAZAAR_API_KEY ?? "";
}

function getBazaarBaseUrl() {
  return (process.env.BAZZAR_BASE_URL ?? process.env.BAZAAR_BASE_URL ?? bazaarBaseUrl).replace(
    /\/$/,
    "",
  );
}

export function hasConfiguredStoryProvider() {
  return Boolean(getBazaarApiKey());
}

export async function requestStoryCompletion({
  prompt,
  messages,
  maxTokens = 1800,
  model = process.env.BAZZAR_MODEL ?? process.env.BAZAAR_MODEL ?? defaultBazaarModel,
  responseFormat = null,
  temperature = 0.72,
}) {
  const resolvedMessages = messages ?? [{ role: "user", content: prompt }];
  const bazaarApiKey = getBazaarApiKey();

  if (bazaarApiKey) {
    return requestBazaarChatCompletion({
      apiKey: bazaarApiKey,
      maxTokens,
      messages: resolvedMessages,
      model,
      responseFormat,
      temperature,
    });
  }

  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    const lastMessage = resolvedMessages[resolvedMessages.length - 1];

    return {
      provider: "local-prototype",
      model: "local-prototype",
      text: prompt ?? lastMessage?.content ?? "",
    };
  }

  throw new Error("AI provider integration is not configured yet.");
}

async function requestBazaarChatCompletion({
  apiKey,
  maxTokens,
  messages,
  model,
  responseFormat,
  temperature,
}) {
  const body = {
    max_tokens: maxTokens,
    messages,
    model,
    temperature,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(`${getBazaarBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "TheTaleRoom",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload?.error?.message ?? payload?.message ?? "BazaarLink request failed.";
    throw new Error(`BazaarLink request failed (${response.status}): ${errorMessage}`);
  }

  const text = payload?.choices?.[0]?.message?.content;

  if (typeof text !== "string") {
    throw new Error("BazaarLink response did not include message content.");
  }

  return {
    model,
    provider: "bazaarlink",
    text,
    usage: payload?.usage ?? null,
  };
}
