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
    base_story_anchor: "string",
    user_emotional_thread: "string",
    return_strategy: "string",
    next_scene_goal: "string",
  },
  closing_summary: {
    narrative_analysis: "string",
    user_emotional_analysis: "string",
    emotional_arc: "string",
    story_return: "string",
    symbolic_meanings: [
      {
        symbol: "string",
        meaning: "string",
      },
    ],
    gentle_takeaway: "string",
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
      interactionHistory: normalizeInteractionHistory(body.interactionHistory),
      mode,
      previousState: body.previousState ?? null,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : "",
      storyId: body.storyId.trim(),
      userInput,
    },
  };
}

function normalizeInteractionHistory(interactionHistory) {
  if (!Array.isArray(interactionHistory)) {
    return [];
  }

  return interactionHistory
    .map((entry, index) => ({
      emotionalMeaning: asStringArray(entry?.emotionalMeaning, []),
      phase: asString(entry?.phase, ""),
      turnIndex: asNumber(entry?.turnIndex, index),
      userInput: asString(entry?.userInput, "").trim(),
    }))
    .filter((entry) => entry.userInput)
    .slice(-8);
}

export async function generateInteractiveStoryTurn({
  baseStoryDocument,
  interactionHistory = [],
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
    interactionHistory,
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
    maxTokens: fallback.phase === "ending" ? 3000 : 2200,
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
        `server_main_arc_position: ${fallback.mainArcPosition}`,
        `server_base_story_anchor: ${fallback.baseStoryAnchor}`,
        `server_user_emotional_thread: ${fallback.userEmotionalThread || "尚未有使用者情緒文本"}`,
        `server_next_scene_goal: ${fallback.nextSceneGoal}`,
        `server_return_strategy: ${fallback.returnStrategy}`,
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
        "基底故事錨定規則：",
        "1. 每一輪都必須把 scene.narration 接回 base_story_document 的目前或下一個情節，不可只延伸使用者自創支線。",
        "2. story_control.base_story_anchor 必須明確說明本輪對應基底故事的哪個情節、物件或轉折。",
        "3. story_control.user_emotional_thread 必須保留 server_user_emotional_thread，並把本輪使用者輸入的情緒文本補進去；這是最終總結分析的依據。",
        "4. story_control.main_arc_position 必須貼近 server_main_arc_position；story_control.next_scene_goal 必須貼近 server_next_scene_goal。",
        "5. 使用者輸入可以改變角色的內在姿態、語氣、象徵物與小行動，但不得讓故事永久偏離基底故事主線。",
        "6. 若使用者輸入很異常，先轉成象徵現象，再用 return_strategy 把它導回基底故事下一個核心事件。",
        "",
        "生成規則摘要：",
        "1. 初始場景 turn_index 為 0，phase 為 opening，使用者輸入解析欄位留空且 risk_level 為 none。",
        "2. 續寫時解析字面行動、情緒意義與敘事功能，但不要像心理分析報告一樣對使用者說明。",
        "3. 階段依序推進，不可無理由跳到結局；完整故事建議 5 至 8 輪。",
        "4. 沉默、拒絕、空白或消極輸入都是有效敘事材料。",
        "5. 異常但非高風險輸入要低干擾轉化成故事中的異常現象，再導回主線。",
        "6. 所有顯示文字都放在 JSON 欄位內。",
        "7. phase 為 ending 時，scene.narration 要像結尾敘事；closing_summary 必須完整填寫，並以 server_user_emotional_thread 為核心材料，分析使用者每輪輸入中的情緒文本如何被故事承接、轉化、導回基底故事。這不是心理診斷，而是故事文本與情緒投射的溫柔閱讀。",
        "8. closing_summary.narrative_analysis 要說明故事主線如何吸收使用者輸入；closing_summary.user_emotional_analysis 要更仔細分析使用者輸入中的情緒詞、行動姿態、沉默或反抗如何形成情緒軌跡；closing_summary.emotional_arc 要總結這條情緒如何變化。不可只寫一句簡短結論。",
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
      base_story_anchor: asString(
        state?.story_control?.base_story_anchor,
        fallback.baseStoryAnchor,
      ),
      user_emotional_thread: fallback.userEmotionalThread,
      return_strategy: asString(state?.story_control?.return_strategy, fallback.returnStrategy),
      next_scene_goal: asString(state?.story_control?.next_scene_goal, fallback.nextSceneGoal),
    },
    closing_summary: normalizeClosingSummary(state?.closing_summary, fallback),
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

function createFallbackContext({
  interactionHistory = [],
  mode,
  previousState,
  sessionId,
  story,
  userInput,
}) {
  const turnIndex =
    mode === "init_story" ? 0 : Math.max(0, asNumber(previousState?.turn_index, 0) + 1);
  const phase = mode === "init_story" ? "opening" : getNextPhase(previousState?.phase, turnIndex);
  const baseStoryTitle = story.displayTitle ?? story.title;
  const quietInput = quietInputPatterns.some((pattern) => pattern.test(userInput.trim()));
  const emotionalMeaning = inferEmotionalMeaning(userInput, quietInput);
  const baseStoryAnchor = getBaseStoryAnchor(story, phase);
  const mainArcPosition = getBaseStoryArcPosition(story, phase);
  const nextSceneGoal = getBaseStoryNextSceneGoal(story, phase);
  const returnStrategy = getBaseStoryReturnStrategy(story, phase, userInput);
  const userEmotionalThread = buildUserEmotionalThread({
    emotionalMeaning,
    interactionHistory,
    mode,
    previousState,
    quietInput,
    turnIndex,
    userInput,
  });

  return {
    baseStoryTitle,
    baseStoryAnchor,
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
    mainArcPosition,
    musicPrompt: "緩慢的環境鋼琴，低音弦樂，溫暖殘響，帶有孤獨與微弱希望的童話氛圍。",
    narration: "",
    narrativeFunction:
      mode === "init_story" ? "" : quietInput ? "將沉默視為敘事材料" : "承接輸入並推動角色靠近主線轉折",
    nextSceneGoal,
    phase,
    returnStrategy,
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
    userEmotionalThread,
    voicePrompt: "溫暖、低柔、緩慢的說書聲，句尾保留短暫停頓，語氣具有陪伴感，不過度戲劇化。",
  };
}

function buildUserEmotionalThread({
  emotionalMeaning,
  interactionHistory,
  mode,
  previousState,
  quietInput,
  turnIndex,
  userInput,
}) {
  const previousThread = asString(previousState?.story_control?.user_emotional_thread, "").trim();
  const historyThread = interactionHistory
    .map((entry) => {
      const entryEmotions = entry.emotionalMeaning.length
        ? entry.emotionalMeaning.join("、")
        : "尚未明確命名";

      return `階段 ${entry.turnIndex}：使用者寫下「${summarizeUserInput(entry.userInput, false)}」，可讀為 ${entryEmotions}。`;
    })
    .join("\n");

  if (mode === "init_story") {
    return historyThread;
  }

  const inputSummary = summarizeUserInput(userInput, quietInput);
  const emotionalText = emotionalMeaning.length ? emotionalMeaning.join("、") : "尚未明確命名";
  const currentInputAlreadyRecorded = interactionHistory.some(
    (entry) => entry.userInput.trim() === userInput.trim(),
  );
  const currentThread =
    `階段 ${turnIndex}：使用者寫下「${inputSummary}」，可讀為 ${emotionalText}；這份輸入會作為角色行動、沉默、反抗或願望的情緒材料。`;

  return [
    previousThread || historyThread,
    currentInputAlreadyRecorded ? "" : currentThread,
  ].filter(Boolean).join("\n");
}

function normalizeClosingSummary(summary, fallback) {
  const fallbackSummary = createFallbackClosingSummary(fallback);

  return {
    narrative_analysis: asString(
      summary?.narrative_analysis,
      fallbackSummary.narrative_analysis,
    ),
    user_emotional_analysis: asString(
      summary?.user_emotional_analysis,
      fallbackSummary.user_emotional_analysis,
    ),
    emotional_arc: asString(summary?.emotional_arc, fallbackSummary.emotional_arc),
    story_return: asString(summary?.story_return, fallbackSummary.story_return),
    symbolic_meanings: normalizeSymbolicMeanings(
      summary?.symbolic_meanings,
      fallbackSummary.symbolic_meanings,
    ),
    gentle_takeaway: asString(summary?.gentle_takeaway, fallbackSummary.gentle_takeaway),
  };
}

function normalizeSymbolicMeanings(symbolicMeanings, fallbackSymbolicMeanings) {
  if (!Array.isArray(symbolicMeanings)) {
    return fallbackSymbolicMeanings;
  }

  const normalizedMeanings = symbolicMeanings
    .map((item) => ({
      meaning: asString(item?.meaning, ""),
      symbol: asString(item?.symbol, ""),
    }))
    .filter((item) => item.symbol && item.meaning);

  return normalizedMeanings.length ? normalizedMeanings : fallbackSymbolicMeanings;
}

function createFallbackClosingSummary(fallback) {
  const emotionalThread = fallback.userEmotionalThread?.trim()
    ? fallback.userEmotionalThread
    : "使用者尚未留下明確回覆，故事主要承接的是角色一開始尚未說出口的願望。";

  return {
    emotional_arc:
      `從使用者輸入累積出的情緒線索來看，故事讓「${fallback.emotionalTone}」從模糊感受變成角色可以採取的小行動。這條弧線不是直接消除情緒，而是讓角色逐步從壓抑、停頓或反抗中，找到能回到主線的姿態。`,
    gentle_takeaway:
      "故事最後留下的不是標準答案，而是一種比較清楚的靠近：願望可以很小，仍然值得被放在光裡。",
    narrative_analysis:
      `這段互動把使用者留下的回覆編進 ${fallback.baseStoryTitle} 的主線：角色仍沿著「${fallback.baseStoryAnchor}」前進，但每次輸入都改變了她面對情節壓力的方式，讓原故事不只是重演，而是多了一層由使用者情緒推動的內在版本。`,
    user_emotional_analysis:
      `本次故事可讀到的使用者情緒文本如下：${emotionalThread} 這些文字的重要性不在於給出診斷，而在於它們提供了角色如何面對委屈、願望、停頓或抗拒的材料；故事把這些材料轉成場景、物件與行動，讓情緒被看見後再慢慢回到敘事主線。`,
    story_return:
      `${fallback.returnStrategy} 因此，故事沒有離開 ${fallback.baseStoryTitle}，而是回到「${fallback.baseStoryAnchor}」這個基底情節。`,
    symbolic_meanings: fallback.symbolicObjects.map((symbol) => ({
      meaning: createFallbackSymbolMeaning(symbol, fallback),
      symbol,
    })),
  };
}

function createFallbackSymbolMeaning(symbol, fallback) {
  const symbolMeanings = {
    爐灰: "代表被忽略、被壓低的生活位置，也代表仍然保有溫度的內在火光。",
    破舊裙襬: "代表外在條件的限制，以及角色尚未被看見的尊嚴。",
    遠方舞會音樂: "代表主線召喚、渴望與被看見的可能性。",
    玻璃鞋: "代表被辨認的證據，也代表角色終於能以自己的形狀留下痕跡。",
    門: "代表故事入口與尚未跨出的選擇。",
    微光: "代表微弱但仍存在的希望。",
    未說出口的願望: "代表還沒有找到語言、但已經開始存在的內在需要。",
  };

  return symbolMeanings[symbol] ??
    `${symbol} 在這裡承接了角色的情緒，讓抽象感受能以故事物件的形式被看見。`;
}

function getBaseStoryAnchor(story, phase) {
  if (story.id !== "cinderella") {
    return `${story.displayTitle ?? story.title} 的基底故事主線`;
  }

  const anchors = {
    opening: "灰姑娘在廚房與壁爐旁承受壓抑，聽見舞會消息與自己的願望",
    first_conflict: "繼母與姊姊阻擋灰姑娘靠近舞會，主角面對不被允許的願望",
    projection: "灰姑娘把渴望、疲憊與想被看見的心情投射到舞會、衣裙與爐灰上",
    turning_point: "幫助者與轉化力量出現，灰姑娘開始把願望轉成行動",
    return: "灰姑娘準備前往舞會，重新接上原故事中被看見的主線",
    resolution: "舞會、午夜與玻璃鞋讓灰姑娘的願望留下可被辨認的痕跡",
    ending: "玻璃鞋與辨認收束故事，灰姑娘從被忽略走向被看見",
  };

  return anchors[phase] ?? anchors.opening;
}

function getBaseStoryArcPosition(story, phase) {
  if (story.id !== "cinderella") {
    return `${story.displayTitle ?? story.title} 的主角正在靠近基底故事的下一個核心事件`;
  }

  const positions = {
    opening: "灰姑娘仍在家中與爐灰旁，舞會消息剛進入她的世界",
    first_conflict: "灰姑娘的願望被家庭權力壓住，尚未獲准前往舞會",
    projection: "灰姑娘開始辨認自己真正想被看見的心情，舞會成為渴望的象徵",
    turning_point: "故事需要讓外在幫助或內在轉化出現，推動她從等待進入行動",
    return: "故事需要把使用者造成的偏移收回，讓灰姑娘重新朝舞會前進",
    resolution: "舞會與午夜的限制已靠近，玻璃鞋即將成為被辨認的象徵",
    ending: "故事收束到玻璃鞋、辨認與灰姑娘重新擁有自己位置的結局",
  };

  return positions[phase] ?? positions.opening;
}

function getBaseStoryNextSceneGoal(story, phase) {
  if (story.id !== "cinderella") {
    return "把使用者輸入轉成角色的小行動，再接回基底故事的下一個轉折。";
  }

  const goals = {
    opening: "讓灰姑娘清楚感覺到舞會召喚與自己很小的願望。",
    first_conflict: "呈現阻擋、委屈與不被允許，讓衝突落在灰姑娘身上。",
    projection: "讓使用者輸入成為象徵物，照出灰姑娘想被看見的核心情緒。",
    turning_point: "讓幫助者、魔法或內在決心出現，推動灰姑娘準備行動。",
    return: "把異常支線收束回前往舞會的路徑，保留使用者選擇帶來的內在改變。",
    resolution: "靠近舞會、午夜與玻璃鞋，讓被看見的痕跡成為情節核心。",
    ending: "用玻璃鞋與辨認收束情緒弧線，說明象徵物與使用者選擇如何回到原故事。",
  };

  return goals[phase] ?? goals.opening;
}

function getBaseStoryReturnStrategy(story, phase, userInput) {
  const inputSummary = userInput.trim()
    ? `「${summarizeUserInput(userInput, false)}」`
    : "沉默或停頓";

  if (story.id !== "cinderella") {
    return `把 ${inputSummary} 轉成角色的象徵動作，再導回基底故事下一個核心事件。`;
  }

  const strategies = {
    opening: `把 ${inputSummary} 放進爐灰、舞會消息或灰姑娘尚未說出口的願望裡。`,
    first_conflict: `讓 ${inputSummary} 變成灰姑娘面對阻擋時的小反應，再回到「不能去舞會」的衝突。`,
    projection: `把 ${inputSummary} 化成衣裙、爐灰、音樂或光影，映出她想被看見的原因。`,
    turning_point: `讓 ${inputSummary} 成為幫助者看見她、或她願意接受幫助的契機。`,
    return: `保留 ${inputSummary} 帶來的內在變化，但把行動方向收回前往舞會。`,
    resolution: `讓 ${inputSummary} 在舞會與午夜限制中留下痕跡，逐步接向玻璃鞋。`,
    ending: `把 ${inputSummary} 收束為玻璃鞋被辨認時的一層意義，回到被看見的結局。`,
  };

  return strategies[phase] ?? strategies.opening;
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
        base_story_anchor: fallback.baseStoryAnchor,
        main_arc_position: fallback.mainArcPosition,
        user_emotional_thread: fallback.userEmotionalThread,
        next_scene_goal: fallback.nextSceneGoal,
        return_strategy: fallback.returnStrategy,
      },
      closing_summary: createFallbackClosingSummary(fallback),
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
        base_story_anchor: "故事因安全風險暫停，暫不錨定基底情節",
        deviation_level: 0,
        main_arc_position: "故事因安全風險暫停",
        user_emotional_thread: fallback.userEmotionalThread,
        next_scene_goal: "先確保使用者取得即時人身安全支持",
        return_strategy: "暫停虛構敘事，不導回主線，安全優先",
      },
      closing_summary: createFallbackClosingSummary({
        ...fallback,
        baseStoryAnchor: "故事暫停處",
        mainArcPosition: "故事因安全風險暫停",
        returnStrategy: "暫停虛構敘事，不導回主線，安全優先",
      }),
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
