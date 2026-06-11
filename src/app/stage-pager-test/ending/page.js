"use client";

import { StoryCheckpointPanel } from "@/app/components/storyRoom/components/StoryCheckpointPanel";
import { StoryStageHeader } from "@/app/components/storyRoom/components/StoryStageHeader";
import { StoryStageProgress } from "@/app/components/storyRoom/components/StoryStageProgress";

const endingStory = {
  displayNarrator: "說書人 · 玻璃鞋",
  narrator: "玻璃鞋",
};

const endingStoryState = {
  phase: "ending",
  is_finished: true,
  frontend_actions: {
    show_input_box: false,
  },
  scene: {
    title: "灰燼之後留下的光",
    narration:
      "夜色終於慢慢安靜下來。灰姑娘站在廚房門邊，看著壁爐裡最後一點火星，像看見自己曾經小心保存的願望。她沒有立刻走向舞會，也沒有急著證明自己值得被看見；她只是把手放在胸口，確認那裡還有溫度。這一次，故事不是把她帶向某個人的目光，而是帶她回到自己的腳步。",
    location: "廚房壁爐旁",
    emotional_tone: "釋然、安靜、自我承接",
    symbolic_objects: ["爐灰", "玻璃鞋", "微光"],
  },
  choice_point: {
    prompt:
      "故事已經走到尾聲。此刻，灰姑娘不需要再回答任何人；她只需要把自己帶回來。",
  },
  closing_summary: {
    narrative_analysis:
      "這段故事把灰姑娘從等待允許的位置，慢慢推向能夠辨認自己願望的位置。她不再只是在舞會、他人眼光或命運安排裡尋找出口，而是開始看見自己其實一直擁有選擇的能力。",
    user_emotional_analysis:
      "你的回覆讓故事更靠近壓抑後的自我照顧：不是立刻反抗所有人，而是先替角色保留一點喘息和誠實。這顯示你在意被忽略的感受，也在尋找一種不必過度用力、卻仍能靠近自己的方式。",
    emotional_arc:
      "情緒從委屈、沉默和被困住，轉向遲疑中的勇氣，最後落在較安靜的承接。這不是突然變得強大，而是開始允許自己有感覺、有渴望，也有慢慢前進的權利。",
    story_return:
      "回到原本的童話時，玻璃鞋仍然可能出現，舞會也仍然會在遠方發亮。但這一次，灰姑娘走向那裡時，不只是被魔法帶走，而是帶著更清楚的自己。",
    symbolic_meanings: [
      {
        symbol: "爐灰",
        meaning: "被壓下的疲憊與委屈，也保存著重新點燃的可能。",
      },
      {
        symbol: "玻璃鞋",
        meaning: "不只是被辨認的證明，也可以是自己選擇道路的重量。",
      },
      {
        symbol: "微光",
        meaning: "微小但沒有熄滅的願望，提醒角色仍能看見自己。",
      },
    ],
    gentle_takeaway:
      "你不需要急著把故事改成勝利。能夠在沉默裡聽見自己，已經是一種回來。",
  },
};

const submittedInput =
  "她沒有急著去舞會，而是先坐在壁爐旁，把那些沒說出口的話寫下來。";

const phaseNames = [
  "開場",
  "初始衝突",
  "情緒投射",
  "選擇",
  "轉折",
  "回聲",
  "回返",
  "結尾",
];

const storyStages = Array.from({ length: 8 }, (_, index) => ({
  checkpointIndex: index,
  key: `ending-test-stage-${index + 1}`,
  storyState: index === 7 ? endingStoryState : null,
  submittedInput: index === 7 ? submittedInput : "",
}));

const activeStageIndex = storyStages.length - 1;
const stageNumbers = storyStages.map((_, index) => `${index + 1}`);
const activeStoryStage = storyStages[activeStageIndex];

export default function EndingStagePagerTestPage() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="relative min-h-screen overflow-y-auto bg-[#050713] text-[#f8e8c4]">
      <div className="pointer-events-none fixed inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-70 blur-xs" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,231,170,0.14),transparent_28%),linear-gradient(180deg,rgba(5,7,19,0.24),rgba(5,7,19,0.88))]" />

      <section className="relative z-10 flex min-h-screen min-w-0 flex-col justify-center px-8 py-8 md:px-20 lg:pl-60 lg:pr-20">
        <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl grid-rows-[auto_minmax(min-content,1fr)_auto] gap-8 lg:min-h-[clamp(38rem,calc(100svh-4rem),52rem)] lg:gap-10">
          <StoryStageHeader
            activeStageIndex={activeStageIndex}
            activeStoryStage={activeStoryStage}
            onBack={() => {}}
            onBackKeyDown={() => {}}
            phaseNames={phaseNames}
            stageNumbers={stageNumbers}
            story={endingStory}
          />

          <section className="grid min-w-0 items-start">
            <StoryCheckpointPanel
              draftInput=""
              isCurrent
              isTurnLoading={false}
              onDraftInputChange={() => {}}
              onSubmit={handleSubmit}
              stageIndex={activeStageIndex}
              storyError=""
              storyState={endingStoryState}
              submittedInput={submittedInput}
            />
          </section>

          <StoryStageProgress
            activeStageIndex={activeStageIndex}
            progressPercent={100}
            stageCount={storyStages.length}
            stageNumbers={stageNumbers}
            stageTotalNumber={`${storyStages.length}`}
            storyStages={storyStages}
          />
        </div>
      </section>
    </main>
  );
}
