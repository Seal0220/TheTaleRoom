import { LoaderCircle, Send } from "lucide-react";
import { getLoadingSceneCopy } from "../helpers/storyRoomCopy";
import { getHoverShiftStyle } from "../helpers/storyRoomMotion";
import { StoryAsideBlock, StorySummaryBlock } from "./StoryBlocks";
import { TypewriterText } from "./TypewriterText";

export function StoryCheckpointPanel({
  draftInput,
  isCurrent,
  isTurnLoading,
  onDraftInputChange,
  onSubmit,
  stageIndex,
  storyError,
  storyState,
  submittedInput,
}) {
  const scene = storyState?.scene;
  const loadingScene = getLoadingSceneCopy(stageIndex, submittedInput);
  const sceneTitle = scene?.title ?? loadingScene.title;
  const sceneNarration = scene?.narration ?? loadingScene.narration;
  const sceneDetail = scene
    ? `${scene.location} · ${scene.emotional_tone}`
    : loadingScene.detail;
  const isEnding = Boolean(storyState?.is_finished || storyState?.phase === "ending");
  const closingSummary = storyState?.closing_summary ?? null;
  const showStoryInput = Boolean(
    isCurrent && storyState?.frontend_actions?.show_input_box && !storyState?.is_finished,
  );
  const symbolicObjects = scene?.symbolic_objects ?? loadingScene.objects;
  const userReply = storyState ? submittedInput?.trim() ?? "" : "";

  return (
    <div className="story-status-surface mx-auto grid h-full min-h-0 w-full min-w-0 max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch">
      <div className="grid h-full min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] gap-5">
        <div
          className="flex h-full min-h-0 min-w-0 max-w-3xl flex-col gap-5 overflow-x-hidden overflow-y-auto pr-4"
          onWheel={(event) => event.stopPropagation()}
        >
          <h2
            className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl"
            style={getHoverShiftStyle(660)}
          >
            {sceneTitle}
          </h2>

          <TypewriterText
            key={sceneNarration}
            className="max-w-2xl text-lg leading-9 text-[#f8e8c4]/86"
            text={sceneNarration}
            style={getHoverShiftStyle(760)}
          />

          {isEnding && closingSummary && (
            <div
              className="grid max-w-2xl gap-4 border-l border-[#f7d995]/30 pl-5"
              style={getHoverShiftStyle(840)}
            >
              <StorySummaryBlock title="故事分析">
                {closingSummary.narrative_analysis}
              </StorySummaryBlock>
              {closingSummary.user_emotional_analysis && (
                <StorySummaryBlock title="情緒文本分析">
                  {closingSummary.user_emotional_analysis}
                </StorySummaryBlock>
              )}
              <StorySummaryBlock title="情緒弧線">
                {closingSummary.emotional_arc}
              </StorySummaryBlock>
              <StorySummaryBlock title="回到原劇情">
                {closingSummary.story_return}
              </StorySummaryBlock>
              {closingSummary.symbolic_meanings?.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
                    象徵物解讀
                  </p>
                  <div className="grid gap-2">
                    {closingSummary.symbolic_meanings.map((item) => (
                      <div
                        className="grid gap-1 rounded-md border border-[#f7d995]/18 bg-tale-ink/24 px-3 py-2"
                        key={`${item.symbol}-${item.meaning}`}
                      >
                        <p className="text-sm font-semibold text-[#ffe9b7]">
                          {item.symbol}
                        </p>
                        <p className="text-sm leading-7 text-[#f8e8c4]/74">
                          {item.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <StorySummaryBlock title="留給你的話">
                {closingSummary.gentle_takeaway}
              </StorySummaryBlock>
            </div>
          )}

          {storyState?.choice_point?.prompt && (
            <div
              className="mt-auto grid max-w-2xl gap-3 border-l border-[#f7d995]/30 pl-5"
              style={getHoverShiftStyle(860)}
            >
              <p className="text-base leading-8 text-[#ffe9b7]">
                {storyState.choice_point.prompt}
              </p>
            </div>
          )}
        </div>

        <div className="grid min-h-47 max-w-2xl content-end gap-3">
          {userReply && (
            <div
              className="grid max-w-2xl gap-2 border-l border-[#f7d995]/22 bg-tale-ink/28 py-2 pl-4"
              style={getHoverShiftStyle(960)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
                你的回覆
              </p>
              <p className="text-sm leading-7 text-[#f8e8c4]/74">
                {userReply}
              </p>
            </div>
          )}

          {showStoryInput && !userReply && (
            <form
              className="grid max-w-2xl gap-3"
              onSubmit={onSubmit}
              style={getHoverShiftStyle(960)}
            >
              <textarea
                className="min-h-28 resize-none rounded-md border border-[#f7d995]/28 bg-tale-ink/62 px-4 py-3 text-base leading-7 text-[#fff3d0] outline-none transition duration-300 placeholder:text-[#f8e8c4]/34 focus:border-[#f7d995]/72 focus:bg-tale-ink/82"
                disabled={isTurnLoading}
                onChange={(event) => onDraftInputChange(event.target.value)}
                placeholder="讓她做什麼、想什麼，或說出一句沒說出口的話..."
                value={draftInput}
              />
              <button
                className="inline-flex h-11 w-fit cursor-pointer items-center justify-center rounded-md border border-[#f7d995]/42 bg-[#110d14]/76 px-5 text-sm font-semibold text-[#ffe9b7] transition duration-500 ease-in-out hover:bg-tale-gold hover:text-[#130b12] disabled:cursor-wait disabled:opacity-70"
                disabled={isTurnLoading}
                type="submit"
              >
                {isTurnLoading ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                送出
              </button>
            </form>
          )}

          {storyError && (
            <p
              className="max-w-2xl rounded-md border border-[#f4a8b8]/30 bg-[#2b111d]/48 px-4 py-3 text-sm leading-7 text-[#ffd9df]"
              style={getHoverShiftStyle(960)}
            >
              {storyError}
            </p>
          )}
        </div>
      </div>

      <aside
        className="grid min-w-0 self-end gap-5 border-t border-[#f7d995]/22 pt-5 text-[#f8e8c4]/82 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
        style={getHoverShiftStyle(1080)}
      >
        <StoryAsideBlock title="此刻場景">
          <p className="text-sm leading-7">
            {sceneDetail}
          </p>
        </StoryAsideBlock>

        <StoryAsideBlock title="象徵物">
          <div className="flex flex-wrap gap-2">
            {symbolicObjects.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
              >
                {tag}
              </span>
            ))}
          </div>
        </StoryAsideBlock>
      </aside>
    </div>
  );
}
