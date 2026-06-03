import { randomUUID } from "node:crypto";

const highRiskPatterns = [
  "kill myself",
  "suicide",
  "end my life",
  "hurt myself",
  "self harm",
];

const emotionPatterns = [
  ["overwhelmed", ["tired", "exhausted", "too much", "overwhelmed"]],
  ["lonely", ["alone", "lonely", "left behind", "forgotten"]],
  ["angry", ["angry", "mad", "rage", "unfair"]],
  ["ashamed", ["shame", "embarrassed", "not enough", "failure"]],
  ["uncertain", ["confused", "lost", "uncertain", "stuck"]],
];

export function validateStoryTurnInput(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body is required." };
  }

  if (typeof body.storyId !== "string" || !body.storyId.trim()) {
    return { ok: false, error: "storyId is required." };
  }

  if (typeof body.message !== "string" || !body.message.trim()) {
    return { ok: false, error: "message is required." };
  }

  if (body.message.length > 2400) {
    return { ok: false, error: "message is too long for one story turn." };
  }

  return { ok: true };
}

export function createGentleBridgeResponse({ story, message }) {
  const emotion = inferEmotionTag(message);
  const needsHumanSupport = detectHighRiskLanguage(message);

  return {
    id: randomUUID(),
    storyId: story.id,
    narrator: story.narrator,
    emotion,
    narratorReply: needsHumanSupport
      ? createSupportiveSafetyReply(story)
      : createNarratorReply({ story, emotion }),
    nextBeat: needsHumanSupport
      ? "pause-and-reach-support"
      : createNextBeat({ story, emotion }),
    safety: {
      needsHumanSupport,
    },
    createdAt: new Date().toISOString(),
  };
}

function detectHighRiskLanguage(message) {
  const normalized = message.toLowerCase();
  return highRiskPatterns.some((pattern) => normalized.includes(pattern));
}

function inferEmotionTag(message) {
  const normalized = message.toLowerCase();
  const match = emotionPatterns.find(([, patterns]) =>
    patterns.some((pattern) => normalized.includes(pattern)),
  );

  return match?.[0] ?? "unspoken";
}

function createNarratorReply({ story, emotion }) {
  return `${story.narrator} stays beside the threshold and lets the ${emotion} feeling have room. Nothing has to become clear all at once. The scene can hold this honestly, then offer one small step back toward the tale.`;
}

function createNextBeat({ story, emotion }) {
  return `${story.title} opens a quieter passage shaped by ${emotion}.`;
}

function createSupportiveSafetyReply(story) {
  return `${story.narrator} pauses the story and stays close. This sounds like a moment for real human support, not just a tale. If you might be in immediate danger, contact local emergency services now. If you can, reach out to someone nearby and let them stay with you.`;
}
