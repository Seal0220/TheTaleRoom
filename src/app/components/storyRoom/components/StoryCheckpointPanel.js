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
    <div className="story-status-surface grid w-full min-w-0 max-w-6xl gap-6 lg:min-h-full lg:grid-rows-[auto_minmax(min-content,1fr)]">
      <h2
        className="min-w-0 max-w-full text-5xl font-semibold leading-tight wrap-break-word text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl"
        style={getHoverShiftStyle(660)}
      >
        {sceneTitle}
      </h2>

      <div className="grid min-w-0 gap-12 lg:grid-rows-[auto_auto]">
        <div
          className="min-h-40 overflow-visible lg:h-82 lg:max-h-82 lg:min-h-82 lg:overflow-x-hidden lg:overflow-y-auto lg:mr-20"
          data-story-stage-scroll
          onWheel={handleScrollableContentWheel}
        >
          <div className="grid gap-5 md:pr-6">
            <TypewriterText
              key={sceneNarration}
              className="text-lg leading-9 text-[#f8e8c4]/86"
              text={sceneNarration}
              style={getHoverShiftStyle(760)}
            />

            {isEnding && closingSummary && (
              <div
                className="grid max-w-full gap-4 border-l border-[#f7d995]/30 pl-5"
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
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div className="grid max-w-full gap-5">
            {storyState?.choice_point?.prompt && (
              <div
                className="grid max-w-full gap-3 border-l border-[#f7d995]/30 pl-5 xl:pr-40"
                style={getHoverShiftStyle(860)}
              >
                <p className="text-base leading-8 text-[#ffe9b7]">
                  {storyState.choice_point.prompt}
                </p>
              </div>
            )}

            {userReply && (
              <div
                className="resize-none rounded-md border border-[#f7d995]/28 bg-tale-ink/62 px-4 py-3 text-base leading-7 text-[#fff3d0] outline-none transition duration-300 placeholder:text-[#f8e8c4]/34 focus:border-[#f7d995]/72 focus:bg-tale-ink/82"
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
                className="grid max-w-full grid-cols-[minmax(0,1fr)_auto] items-end gap-3"
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
                className="max-w-full rounded-md border border-[#f4a8b8]/30 bg-[#2b111d]/48 px-4 py-3 text-sm leading-7 text-[#ffd9df]"
                style={getHoverShiftStyle(960)}
              >
                {storyError}
              </p>
            )}
          </div>

          <aside
            className="grid min-w-0 self-end gap-5 border-t border-[#f7d995]/22 pt-5 text-[#f8e8c4]/82 md:grid-cols-2 md:gap-8 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 lg:pr-10"
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
      </div>
    </div>
  );
}

function handleScrollableContentWheel(event) {
  const element = event.currentTarget;
  const hasVerticalOverflow = element.scrollHeight > element.clientHeight + 1;

  if (!hasVerticalOverflow) {
    return;
  }

  const canScrollUp = element.scrollTop > 0;
  const canScrollDown =
    element.scrollTop + element.clientHeight < element.scrollHeight - 1;

  if ((event.deltaY < 0 && canScrollUp) || (event.deltaY > 0 && canScrollDown)) {
    event.stopPropagation();
  }
}
