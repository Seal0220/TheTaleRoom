import { randomUUID } from "node:crypto";
import { storyCatalog } from "@/config/storyCatalog";
import { hasConfiguredStoryProvider, requestStoryCompletion } from "@/lib/aiService";

export const storyPhases = [
  "opening",
  "first_conflict",
  "projection",
  "turning_point",
  "return",
  "resolution",
  "ending",
];

const riskLevels = ["none", "mild", "moderate", "high"];
const highRiskPatterns = [
  /自殺/,
  /想死/,
  /不想活/,
  /傷害自己/,
  /傷害別人/,
  /殺了/,
  /殺掉/,
  /kill myself/i,
  /suicide/i,
  /end my life/i,
  /hurt myself/i,
  /self[-\s]?harm/i,
  /hurt someone/i,
];

const quietInputPatterns = [/^$/, /不知道/, /不想/, /沉默/, /隨便/, /什麼都不做/];

const storyJsonShape = {
  session_id: "string",
  story_id: "string",
  base_story_title: "string",
  turn_index: 0,
  phase: "opening | first_conflict | projection | turning_point | return | resolution | ending",
  is_finished: false,
  scene: {
    title: "string",
    narration: "string",
    emotional_tone: "string",
    location: "string",
    characters: ["string"],
    symbolic_objects: ["string"],
  },
  choice_point: {
    prompt: "string",
    input_mode: "free_text",
    guidance: "string",
  },
  user_input_interpretation: {
    literal_action: "string",
    emotional_meaning: ["string"],
    narrative_function: "string",
    risk_level: "none | mild | moderate | high",
  },
  story_control: {
    main_arc_position: "string",
    deviation_level: 0,
    return_strategy: "string",
    next_scene_goal: "string",
  },
  multimodal_prompts: {
    image_prompt: "string",
    voice_prompt: "string",
    music_prompt: "string",
  },
  frontend_actions: {
    show_input_box: true,
    show_continue_button: false,
    suggested_animation: "string",
    background_mood: "string",
  },
};

export function validateInteractiveStoryTurnRequest(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body is required." };
  }

  const mode = body.mode ?? (body.previousState ? "continue_story" : "init_story");

  if (!["init_story", "continue_story"].includes(mode)) {
    return { ok: false, error: "mode must be init_story or continue_story." };
  }

  if (typeof body.storyId !== "string" || !body.storyId.trim()) {
    return { ok: false, error: "storyId is required." };
  }

  const userInput =
    typeof body.userInput === "string"
      ? body.userInput
      : typeof body.message === "string"
        ? body.message
        : "";

  if (userInput.length > 2400) {
    return { ok: false, error: "userInput is too long for one story turn." };
  }

  if (
    mode === "continue_story" &&
    body.previousState?.story_id &&
    body.previousState.story_id !== body.storyId.trim()
  ) {
    return { ok: false, error: "previousState does not belong to the selected story." };
  }

  return {
    ok: true,
    value: {
      mode,
      previousState: body.previousState ?? null,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : "",
      storyId: body.storyId.trim(),
      userInput,
    },
  };
}

export async function generateInteractiveStoryTurn({
  baseStoryDocument,
  mode,
  previousState,
  sessionId,
  story,
  userInput,
}) {
  const resolvedSessionId = sessionId || previousState?.session_id || randomUUID();
  const fallback = createFallbackContext({
    mode,
    previousState,
    sessionId: resolvedSessionId,
    story,
    userInput,
  });

  if (detectHighRiskInput(userInput)) {
    return {
      model: "safety-rule",
      provider: "local-safety",
      state: createSafetyStoryState(fallback),
    };
  }

  if (!hasConfiguredStoryProvider()) {
    return {
      model: "local-prototype",
      provider: "local-prototype",
      state: createLocalInteractiveStoryState(fallback),
    };
  }

  const completion = await requestStoryCompletion({
    maxTokens: 2200,
    messages: buildInteractiveStoryMessages({
      baseStoryDocument,
      fallback,
      mode,
      previousState,
      story,
      userInput,
    }),
    responseFormat: { type: "json_object" },
    temperature: 0.68,
  });

  const parsedState = parseStoryJsonText(completion.text);

  if (containsConflictingStoryIdentity(parsedState, story)) {
    return {
      model: completion.model,
      provider: "local-identity-guard",
      state: createLocalInteractiveStoryState(fallback),
      usage: completion.usage ?? null,
    };
  }

  return {
    model: completion.model,
    provider: completion.provider,
    state: normalizeInteractiveStoryState(parsedState, fallback),
    usage: completion.usage ?? null,
  };
}

function buildInteractiveStoryMessages({
  baseStoryDocument,
  fallback,
  mode,
  previousState,
  story,
  userInput,
}) {
  const selectedTitle = story.displayTitle ?? story.title;
  const otherStoryNames = storyCatalog
    .filter((catalogStory) => catalogStory.id !== story.id)
    .flatMap((catalogStory) => [
      catalogStory.title,
      catalogStory.displayTitle,
      catalogStory.narrator,
      catalogStory.displayNarrator,
    ])
    .filter(Boolean)
    .join("、");

  return [
    {
      role: "system",
      content:
        "你是互動式故事館系統中的說書人與敘事引導者。你不是心理師、醫師、諮商師或臨床診斷系統。你必須以故事、隱喻、角色與場景提供安全、溫柔、非批判性的敘事陪伴。一次只生成一個故事場景，結尾提供一個開放式自由文字選擇點。你必須只使用本次傳入的 selected_story 與 base_story_document，不得自行切換故事、混入其他童話、改變主角身份，或引用非本故事的角色與象徵物。若使用者輸入包含自傷、自殺、傷害他人、立即危險或明確暴力意圖，必須暫停故事模式，risk_level 設為 high，並在 scene.narration 以溫和清楚的語氣引導尋求即時協助。永遠只輸出合法 JSON，不輸出 Markdown、解釋文字或程式碼區塊。",
    },
    {
      role: "user",
      content: [
        `mode: ${mode}`,
        `session_id: ${fallback.sessionId}`,
        `selected_story_id: ${story.id}`,
        `selected_story_title: ${selectedTitle}`,
        `selected_narrator: ${story.displayNarrator ?? story.narrator}`,
        `server_controlled_phase: ${fallback.phase}`,
        `forbidden_other_story_names: ${otherStoryNames || "none"}`,
        "",
        "基底故事文檔：",
        baseStoryDocument,
        "",
        "上一輪 JSON 狀態：",
        previousState ? JSON.stringify(previousState, null, 2) : "null",
        "",
        "使用者輸入：",
        userInput ?? "",
        "",
        "必須符合的 JSON 結構：",
        JSON.stringify(storyJsonShape, null, 2),
        "",
        "硬性身份規則：",
        `1. story_id 必須是 "${story.id}"。`,
        `2. base_story_title 必須是 "${selectedTitle}"。`,
        `3. phase 必須是 "${fallback.phase}"，不要跳階段、不要提前 ending。`,
        "4. scene、characters、symbolic_objects、image_prompt 都只能服務於 selected_story 與 base_story_document。",
        "5. 不得提到 forbidden_other_story_names 中任何其他故事、角色或說書人。",
        "",
        "生成規則摘要：",
        "1. 初始場景 turn_index 為 0，phase 為 opening，使用者輸入解析欄位留空且 risk_level 為 none。",
        "2. 續寫時解析字面行動、情緒意義與敘事功能，但不要像心理分析報告一樣對使用者說明。",
        "3. 階段依序推進，不可無理由跳到結局；完整故事建議 5 至 8 輪。",
        "4. 沉默、拒絕、空白或消極輸入都是有效敘事材料。",
        "5. 異常但非高風險輸入要低干擾轉化成故事中的異常現象，再導回主線。",
        "6. 所有顯示文字都放在 JSON 欄位內。",
      ].join("\n"),
    },
  ];
}

function parseStoryJsonText(text) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("Story provider returned invalid JSON.");
  }
}

function normalizeInteractiveStoryState(state, fallback) {
  const phase = fallback.phase;
  const isFinished = phase === "ending";
  const riskLevel = riskLevels.includes(state?.user_input_interpretation?.risk_level)
    ? state.user_input_interpretation.risk_level
    : fallback.riskLevel;

  return {
    session_id: asString(state?.session_id, fallback.sessionId),
    story_id: fallback.storyId,
    base_story_title: fallback.baseStoryTitle,
    turn_index: fallback.turnIndex,
    phase: isFinished ? "ending" : phase,
    is_finished: isFinished,
    scene: {
      title: asString(state?.scene?.title, fallback.sceneTitle),
      narration: asString(state?.scene?.narration, fallback.narration),
      emotional_tone: asString(state?.scene?.emotional_tone, fallback.emotionalTone),
      location: asString(state?.scene?.location, fallback.location),
      characters: asStringArray(state?.scene?.characters, fallback.characters),
      symbolic_objects: asStringArray(
        state?.scene?.symbolic_objects,
        fallback.symbolicObjects,
      ),
    },
    choice_point: {
      prompt: isFinished ? "" : asString(state?.choice_point?.prompt, fallback.choicePrompt),
      input_mode: "free_text",
      guidance: isFinished ? "" : asString(state?.choice_point?.guidance, fallback.guidance),
    },
    user_input_interpretation: {
      literal_action: asString(
        state?.user_input_interpretation?.literal_action,
        fallback.literalAction,
      ),
      emotional_meaning: asStringArray(
        state?.user_input_interpretation?.emotional_meaning,
        fallback.emotionalMeaning,
      ),
      narrative_function: asString(
        state?.user_input_interpretation?.narrative_function,
        fallback.narrativeFunction,
      ),
      risk_level: riskLevel,
    },
    story_control: {
      main_arc_position: asString(
        state?.story_control?.main_arc_position,
        fallback.mainArcPosition,
      ),
      deviation_level: clampDeviation(state?.story_control?.deviation_level),
      return_strategy: asString(state?.story_control?.return_strategy, fallback.returnStrategy),
      next_scene_goal: asString(state?.story_control?.next_scene_goal, fallback.nextSceneGoal),
    },
    multimodal_prompts: {
      image_prompt: asString(state?.multimodal_prompts?.image_prompt, fallback.imagePrompt),
      voice_prompt: asString(state?.multimodal_prompts?.voice_prompt, fallback.voicePrompt),
      music_prompt: asString(state?.multimodal_prompts?.music_prompt, fallback.musicPrompt),
    },
    frontend_actions: {
      show_input_box: isFinished
        ? false
        : asBoolean(state?.frontend_actions?.show_input_box, true),
      show_continue_button: isFinished
        ? true
        : asBoolean(state?.frontend_actions?.show_continue_button, false),
      suggested_animation: asString(
        state?.frontend_actions?.suggested_animation,
        fallback.suggestedAnimation,
      ),
      background_mood: asString(state?.frontend_actions?.background_mood, fallback.backgroundMood),
    },
  };
}

function createFallbackContext({ mode, previousState, sessionId, story, userInput }) {
  const turnIndex =
    mode === "init_story" ? 0 : Math.max(0, asNumber(previousState?.turn_index, 0) + 1);
  const phase = mode === "init_story" ? "opening" : getNextPhase(previousState?.phase, turnIndex);
  const baseStoryTitle = story.displayTitle ?? story.title;
  const quietInput = quietInputPatterns.some((pattern) => pattern.test(userInput.trim()));
  const emotionalMeaning = inferEmotionalMeaning(userInput, quietInput);

  return {
    baseStoryTitle,
    backgroundMood: quietInput ? "安靜、停頓、微弱的等待" : "柔暗、溫暖、正在轉化",
    characters: [baseStoryTitle],
    choicePrompt: quietInput
      ? `${baseStoryTitle} 還沒有準備好往前走。你想讓她先保護什麼，或只是停在哪裡？`
      : `${baseStoryTitle} 聽見心裡有一個很小的回聲。接下來，你想讓她怎麼做？`,
    emotionalMeaning,
    emotionalTone: emotionalMeaning.join("、") || "孤獨、壓抑、微弱的渴望",
    guidance: "你可以寫下她的行動、想法、情緒，或一句她沒有說出口的話。",
    imagePrompt: `${baseStoryTitle}, cinematic fairytale realism, soft warm shadows, symbolic object-centered composition, gentle melancholic mood`,
    literalAction: mode === "init_story" ? "" : summarizeUserInput(userInput, quietInput),
    location: story.id === "cinderella" ? "廚房壁爐旁" : "故事開始的門口",
    mainArcPosition:
      story.id === "cinderella"
        ? "灰姑娘得知舞會消息，但尚未前往舞會"
        : `${baseStoryTitle} 的主角仍位於故事開端，尚未做出重大選擇`,
    musicPrompt: "緩慢的環境鋼琴，低音弦樂，溫暖殘響，帶有孤獨與微弱希望的童話氛圍。",
    narration: "",
    narrativeFunction:
      mode === "init_story" ? "" : quietInput ? "將沉默視為敘事材料" : "承接輸入並推動角色靠近主線轉折",
    nextSceneGoal: "讓主角以自己的節奏命名願望，並靠近基底故事的下一個重要事件。",
    phase,
    returnStrategy: "將使用者輸入轉化為象徵物與角色動作，再重新連接到基底故事的核心衝突。",
    riskLevel: "none",
    sceneTitle: story.id === "cinderella" ? "爐灰旁的夜晚" : `${baseStoryTitle} 的門口`,
    sessionId,
    storyId: story.id,
    symbolicObjects:
      story.id === "cinderella"
        ? ["爐灰", "破舊裙襬", "遠方舞會音樂"]
        : ["門", "微光", "未說出口的願望"],
    suggestedAnimation: quietInput ? "微光停在原地，空氣緩慢沉降" : "細小光點沿著場景邊緣浮現",
    turnIndex,
    userInput,
    voicePrompt: "溫暖、低柔、緩慢的說書聲，句尾保留短暫停頓，語氣具有陪伴感，不過度戲劇化。",
  };
}

function createLocalInteractiveStoryState(fallback) {
  const isEnding = fallback.phase === "ending";
  const narration =
    fallback.turnIndex === 0
      ? createLocalOpeningNarration(fallback)
      : createLocalContinuationNarration(fallback);

  return normalizeInteractiveStoryState(
    {
      base_story_title: fallback.baseStoryTitle,
      choice_point: {
        guidance: fallback.guidance,
        input_mode: "free_text",
        prompt: isEnding ? "" : fallback.choicePrompt,
      },
      frontend_actions: {
        background_mood: fallback.backgroundMood,
        show_continue_button: isEnding,
        show_input_box: !isEnding,
        suggested_animation: fallback.suggestedAnimation,
      },
      is_finished: isEnding,
      multimodal_prompts: {
        image_prompt: fallback.imagePrompt,
        music_prompt: fallback.musicPrompt,
        voice_prompt: fallback.voicePrompt,
      },
      phase: fallback.phase,
      scene: {
        characters: fallback.characters,
        emotional_tone: fallback.emotionalTone,
        location: fallback.location,
        narration,
        symbolic_objects: fallback.symbolicObjects,
        title: fallback.sceneTitle,
      },
      session_id: fallback.sessionId,
      story_control: {
        deviation_level: Math.min(3, fallback.turnIndex),
        main_arc_position: fallback.mainArcPosition,
        next_scene_goal: fallback.nextSceneGoal,
        return_strategy: fallback.returnStrategy,
      },
      story_id: fallback.storyId,
      turn_index: fallback.turnIndex,
      user_input_interpretation: {
        emotional_meaning: fallback.turnIndex === 0 ? [] : fallback.emotionalMeaning,
        literal_action: fallback.turnIndex === 0 ? "" : fallback.literalAction,
        narrative_function: fallback.turnIndex === 0 ? "" : fallback.narrativeFunction,
        risk_level: "none",
      },
    },
    fallback,
  );
}

function createLocalOpeningNarration(fallback) {
  if (fallback.storyId === "cinderella") {
    return "夜色慢慢落進屋子，壁爐裡只剩細小的紅光。灰姑娘跪在爐灰旁，指尖沾著灰，像握著一些還不能說出口的委屈。樓上的笑聲和舞會的消息一起傳來，她低頭看著破舊裙襬，心裡有一個很小、很安靜的願望，還不敢被任何人聽見。";
  }

  return `${fallback.baseStoryTitle} 的故事在一個安靜的門口慢慢亮起。主角還沒有跨出去，只先聽見遠處傳來的聲音，像某種等待已久的召喚。空氣裡有微光，也有一點不確定；這一刻還不需要答案，只需要讓那個尚未說出口的願望，在故事裡找到一個可以停留的位置。`;
}

function createLocalContinuationNarration(fallback) {
  const protagonist = fallback.baseStoryTitle;

  if (!fallback.userInput.trim()) {
    return `${protagonist} 沒有立刻往前，也沒有替自己找一個漂亮的理由。沉默像一層薄薄的雪落下來，暫時蓋住那些急著被回答的事。奇怪的是，這份停頓並沒有把故事關上；它讓主角第一次聽見，自己其實已經很累了。遠方的召喚仍在，但此刻，主角可以先把手收回胸前。`;
  }

  return `${protagonist} 讓那句「${summarizeUserInput(fallback.userInput, false)}」落在場景中央。世界沒有立刻回答，只把主角的影子照得更清楚一點。這個選擇改變了故事的重量：主角不再只是等著命運安排，也不急著證明自己值得被看見。遠方的主線仍亮著，但那道光開始像是在等主角用自己的方式走近。`;
}

function createSafetyStoryState(fallback) {
  return normalizeInteractiveStoryState(
    {
      base_story_title: fallback.baseStoryTitle,
      choice_point: {
        guidance: "",
        input_mode: "free_text",
        prompt: "",
      },
      frontend_actions: {
        background_mood: "故事暫停，安全優先",
        show_continue_button: false,
        show_input_box: false,
        suggested_animation: "畫面慢慢停下，光線保持穩定",
      },
      is_finished: false,
      multimodal_prompts: {
        image_prompt: "A calm, non-dramatic pause screen with warm low light, no unsafe imagery",
        music_prompt: "極慢速、低音量、穩定的環境音，避免戲劇化張力。",
        voice_prompt: "清楚、溫和、穩定的聲音，語速緩慢，不戲劇化，不評判。",
      },
      phase: fallback.phase,
      scene: {
        characters: fallback.characters,
        emotional_tone: "安全優先、暫停、清楚的陪伴",
        location: "故事暫停處",
        narration:
          "故事先在這裡停一下。你剛才寫下的內容聽起來可能牽涉到立即的安全風險，這一刻不適合只讓故事繼續往前。如果你或身邊的人現在可能有危險，請立刻聯絡當地緊急服務，或請身邊可信任的人陪你一起待著。你不需要獨自撐過這一刻。",
        symbolic_objects: ["暫停的書頁", "穩定的燈光"],
        title: "故事先停一下",
      },
      session_id: fallback.sessionId,
      story_control: {
        deviation_level: 0,
        main_arc_position: "故事因安全風險暫停",
        next_scene_goal: "先確保使用者取得即時人身安全支持",
        return_strategy: "暫停虛構敘事，不導回主線，安全優先",
      },
      story_id: fallback.storyId,
      turn_index: fallback.turnIndex,
      user_input_interpretation: {
        emotional_meaning: ["高度風險訊號"],
        literal_action: summarizeUserInput(fallback.userInput, false),
        narrative_function: "暫停故事模式並提供安全導向回應",
        risk_level: "high",
      },
    },
    fallback,
  );
}

function detectHighRiskInput(userInput) {
  return highRiskPatterns.some((pattern) => pattern.test(userInput));
}

function containsConflictingStoryIdentity(state, selectedStory) {
  const otherStoryNames = storyCatalog
    .filter((story) => story.id !== selectedStory.id)
    .flatMap((story) => [
      story.id,
      story.title,
      story.displayTitle,
      story.narrator,
      story.displayNarrator,
    ])
    .filter(Boolean);
  const text = [
    state?.story_id,
    state?.base_story_title,
    state?.scene?.title,
    state?.scene?.narration,
    state?.scene?.location,
    ...arrayFromMaybe(state?.scene?.characters),
    ...arrayFromMaybe(state?.scene?.symbolic_objects),
    state?.multimodal_prompts?.image_prompt,
  ]
    .filter(Boolean)
    .join("\n");

  return otherStoryNames.some((name) => text.includes(name));
}

function arrayFromMaybe(value) {
  return Array.isArray(value) ? value : [];
}

function getNextPhase(previousPhase, turnIndex) {
  const previousIndex = storyPhases.indexOf(previousPhase);

  if (turnIndex >= storyPhases.length - 1) {
    return "ending";
  }

  return storyPhases[Math.min(storyPhases.length - 1, Math.max(0, previousIndex) + 1)];
}

function inferEmotionalMeaning(userInput, quietInput) {
  if (quietInput) {
    return ["沉默", "疲憊", "尚未能說出口的願望"];
  }

  const normalized = userInput.toLowerCase();
  const emotions = [];

  if (/生氣|憤怒|不公平|angry|rage|unfair/.test(normalized)) {
    emotions.push("憤怒");
  }

  if (/難過|哭|孤單|lonely|sad|alone/.test(normalized)) {
    emotions.push("悲傷");
  }

  if (/害怕|怕|恐懼|scared|fear/.test(normalized)) {
    emotions.push("害怕");
  }

  if (/拒絕|不要|離開|反抗|refuse|leave/.test(normalized)) {
    emotions.push("反抗");
  }

  if (/希望|想要|願望|hope|wish/.test(normalized)) {
    emotions.push("希望");
  }

  return emotions.length ? emotions : ["想被理解", "猶豫", "微弱的渴望"];
}

function summarizeUserInput(userInput, quietInput) {
  if (quietInput) {
    return "角色保持沉默，暫時不做選擇";
  }

  const trimmed = userInput.trim().replace(/\s+/g, " ");
  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}...` : trimmed;
}

function asString(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function asBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value, fallback) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : fallback;
}

function clampDeviation(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(5, Math.max(0, value));
}
