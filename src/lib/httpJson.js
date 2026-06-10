const retryableStatusCodes = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

export class HttpJsonError extends Error {
  constructor(
    message,
    { cause = undefined, payload = null, retryable = false, status = null } = {},
  ) {
    super(message, cause ? { cause } : undefined);
    this.name = "HttpJsonError";
    this.payload = payload;
    this.retryable = retryable;
    this.status = status;
  }
}

export async function postJson(url, body, options = {}) {
  const {
    headers = {},
    retries = 0,
    retryDelayMs = 700,
    timeoutMs = 0,
  } = options;
  const attemptCount = Math.max(1, retries + 1);
  let lastError = null;

  for (let attemptIndex = 0; attemptIndex < attemptCount; attemptIndex += 1) {
    try {
      return await postJsonOnce(url, body, { headers, timeoutMs });
    } catch (error) {
      lastError = error;

      if (attemptIndex >= attemptCount - 1 || !shouldRetryPostJsonError(error)) {
        throw error;
      }

      await wait(getRetryDelayMs(retryDelayMs, attemptIndex));
    }
  }

  throw lastError;
}

async function postJsonOnce(url, body, { headers, timeoutMs }) {
  const controller = timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => {
      controller.abort();
    }, timeoutMs)
    : null;
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: controller?.signal,
    });
  } catch (error) {
    throw new HttpJsonError(
      controller?.signal.aborted
        ? "Request timed out."
        : error.message ?? "Request failed.",
      {
        cause: error,
        retryable: true,
      },
    );
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HttpJsonError(payload?.error ?? "Request failed.", {
      payload,
      retryable: retryableStatusCodes.has(response.status),
      status: response.status,
    });
  }

  return payload;
}

function shouldRetryPostJsonError(error) {
  return Boolean(error?.retryable);
}

function getRetryDelayMs(retryDelayMs, attemptIndex) {
  return retryDelayMs * (attemptIndex + 1);
}

function wait(ms) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
