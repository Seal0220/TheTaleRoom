import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { requestStoryCompletion } from "../src/lib/aiService.js";
import { HttpJsonError, postJson } from "../src/lib/httpJson.js";

const originalFetch = globalThis.fetch;
const originalEnv = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  BAZAAR_API_KEY: process.env.BAZAAR_API_KEY,
  BAZZAR_API_KEY: process.env.BAZZAR_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

afterEach(() => {
  globalThis.fetch = originalFetch;

  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

test("postJson retries temporary API failures before returning a successful payload", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;

    if (calls === 1) {
      return createJsonResponse({ error: "The story room is busy." }, 503);
    }

    return createJsonResponse({ state: { scene: { title: "下一頁" } } }, 200);
  };

  const payload = await postJson(
    "/api/story/turn",
    { storyId: "cinderella" },
    { retries: 1, retryDelayMs: 0 },
  );

  assert.equal(calls, 2);
  assert.deepEqual(payload, { state: { scene: { title: "下一頁" } } });
});

test("postJson does not retry request validation errors", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return createJsonResponse({ error: "storyId is required." }, 400);
  };

  await assert.rejects(
    () => postJson("/api/story/turn", {}, { retries: 2, retryDelayMs: 0 }),
    (error) => {
      assert.ok(error instanceof HttpJsonError);
      assert.equal(error.status, 400);
      assert.equal(error.message, "storyId is required.");
      return true;
    },
  );
  assert.equal(calls, 1);
});

test("requestStoryCompletion retries transient BazaarLink failures", async () => {
  process.env.BAZZAR_API_KEY = "test-key";
  delete process.env.BAZAAR_API_KEY;
  let calls = 0;

  globalThis.fetch = async () => {
    calls += 1;

    if (calls === 1) {
      return createJsonResponse({ error: { message: "Too many requests." } }, 429);
    }

    return createJsonResponse(
      {
        choices: [
          {
            message: {
              content: "{\"scene\":{\"title\":\"燈旁的下一頁\"}}",
            },
          },
        ],
        usage: { total_tokens: 42 },
      },
      200,
    );
  };

  const result = await requestStoryCompletion({
    prompt: "continue",
    retryAttempts: 2,
    retryDelayMs: 0,
    timeoutMs: 1000,
  });

  assert.equal(calls, 2);
  assert.equal(result.provider, "bazaarlink");
  assert.equal(result.text, "{\"scene\":{\"title\":\"燈旁的下一頁\"}}");
  assert.deepEqual(result.usage, { total_tokens: 42 });
});

test("requestStoryCompletion does not retry provider timeouts", async () => {
  process.env.BAZZAR_API_KEY = "test-key";
  delete process.env.BAZAAR_API_KEY;
  let calls = 0;

  globalThis.fetch = async (_url, options) => {
    calls += 1;

    return new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        reject(new Error("aborted"));
      });
    });
  };

  await assert.rejects(
    () => requestStoryCompletion({
      prompt: "continue",
      retryAttempts: 3,
      retryDelayMs: 0,
      timeoutMs: 1,
    }),
    /timed out/,
  );
  assert.equal(calls, 1);
});

test("requestStoryCompletion falls back locally when no provider is configured", async () => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.BAZAAR_API_KEY;
  delete process.env.BAZZAR_API_KEY;
  delete process.env.OPENAI_API_KEY;

  const result = await requestStoryCompletion({ prompt: "local story prompt" });

  assert.equal(result.provider, "local-prototype");
  assert.equal(result.model, "local-prototype");
  assert.equal(result.text, "local story prompt");
});

function createJsonResponse(payload, status) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}
