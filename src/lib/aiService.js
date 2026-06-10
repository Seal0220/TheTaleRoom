const bazaarBaseUrl = "https://bazaarlink.ai/api/v1";
const defaultBazaarModel = "openai/gpt-4.1";
const defaultRetryAttempts = 3;
const defaultRetryDelayMs = 850;
const defaultTimeoutMs = 60000;
const retryableStatusCodes = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

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
  retryAttempts = parsePositiveInteger(
    process.env.BAZZAR_RETRY_ATTEMPTS ?? process.env.BAZAAR_RETRY_ATTEMPTS,
    defaultRetryAttempts,
  ),
  retryDelayMs = parsePositiveInteger(
    process.env.BAZZAR_RETRY_DELAY_MS ?? process.env.BAZAAR_RETRY_DELAY_MS,
    defaultRetryDelayMs,
  ),
  temperature = 0.72,
  timeoutMs = parsePositiveInteger(
    process.env.BAZZAR_TIMEOUT_MS ?? process.env.BAZAAR_TIMEOUT_MS,
    defaultTimeoutMs,
  ),
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
      retryAttempts,
      retryDelayMs,
      temperature,
      timeoutMs,
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
  retryAttempts,
  retryDelayMs,
  temperature,
  timeoutMs,
}) {
  const attemptCount = Math.max(1, retryAttempts);
  let lastError = null;

  for (let attemptIndex = 0; attemptIndex < attemptCount; attemptIndex += 1) {
    try {
      return await requestBazaarChatCompletionOnce({
        apiKey,
        maxTokens,
        messages,
        model,
        responseFormat,
        temperature,
        timeoutMs,
      });
    } catch (error) {
      lastError = error;

      if (attemptIndex >= attemptCount - 1 || !isRetryableStoryProviderError(error)) {
        throw error;
      }

      await wait(getRetryDelayMs(retryDelayMs, attemptIndex));
    }
  }

  throw lastError;
}

async function requestBazaarChatCompletionOnce({
  apiKey,
  maxTokens,
  messages,
  model,
  responseFormat,
  temperature,
  timeoutMs,
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  let response;

  try {
    response = await fetch(`${getBazaarBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "TheTaleRoom",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = controller.signal.aborted;

    throw createStoryProviderError(
      timedOut
        ? `BazaarLink request timed out after ${timeoutMs} ms.`
        : `BazaarLink request failed: ${error.message ?? "Network error."}`,
      {
        cause: error,
        retryable: !timedOut,
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload?.error?.message ?? payload?.message ?? "BazaarLink request failed.";
    throw createStoryProviderError(
      `BazaarLink request failed (${response.status}): ${errorMessage}`,
      {
        retryable: retryableStatusCodes.has(response.status),
        status: response.status,
      },
    );
  }

  const text = payload?.choices?.[0]?.message?.content;

  if (typeof text !== "string") {
    throw createStoryProviderError(
      "BazaarLink response did not include message content.",
      { retryable: true },
    );
  }

  return {
    model,
    provider: "bazaarlink",
    text,
    usage: payload?.usage ?? null,
  };
}

function createStoryProviderError(
  message,
  { cause = undefined, retryable = false, status = null } = {},
) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.retryable = retryable;
  error.status = status;
  return error;
}

function getRetryDelayMs(retryDelayMs, attemptIndex) {
  return retryDelayMs * (attemptIndex + 1);
}

export function isRetryableStoryProviderError(error) {
  return Boolean(error?.retryable);
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function wait(ms) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
