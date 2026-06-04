import { NextResponse } from "next/server";
import { insertRecord } from "@/lib/database";
import {
  generateInteractiveStoryTurn,
  validateInteractiveStoryTurnRequest,
} from "@/lib/interactiveStoryRules";
import { readBaseStoryDocument } from "@/lib/storyDocuments";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const validation = validateInteractiveStoryTurnRequest(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { mode, previousState, sessionId, storyId, userInput } = validation.value;
  const baseStory = await readBaseStoryDocument(storyId);

  if (!baseStory.ok) {
    return NextResponse.json({ error: baseStory.error }, { status: baseStory.status });
  }

  const result = await generateInteractiveStoryTurn({
    baseStoryDocument: baseStory.document.text,
    mode,
    previousState,
    sessionId,
    story: baseStory.story,
    userInput,
  });

  insertRecord({
    id: `${result.state.session_id}-${result.state.turn_index}`,
    account_id: "prototype",
    feature: "interactive-story-room",
    title: result.state.scene.title,
    metadata: {
      baseStoryPath: baseStory.document.path,
      model: result.model,
      phase: result.state.phase,
      provider: result.provider,
      riskLevel: result.state.user_input_interpretation.risk_level,
      storyId,
    },
    input: {
      mode,
      previousTurnIndex: previousState?.turn_index ?? null,
      storyId,
      userInput,
    },
    result: result.state,
    score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({
    model: result.model,
    provider: result.provider,
    state: result.state,
    usage: result.usage ?? null,
  });
}
