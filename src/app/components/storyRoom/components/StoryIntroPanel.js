import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { emotionLabels } from "../helpers/storyRoomLabels";

export function StoryIntroPanel({ isSwitchHovered, onBack, story, storyError }) {
  const emotionTags = story.emotions.map((emotion) => emotionLabels[emotion] ?? emotion);

  return (
    <div className="grid w-full shrink-0 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
      <div
        className={`grid gap-8 transition duration-800 ease-in-out
          ${isSwitchHovered ? "-translate-x-6 xl:-translate-x-12" : ""}`}
      >
        <Button
          arrowL
          onClick={onBack}
        >
          返回入口
        </Button>

        <div className="grid max-w-3xl gap-5">
          <div className="flex items-center gap-3 text-sm font-medium tracking-[0.18em] text-[#f6d797]">
            <BookOpen className="h-4 w-4" />
            <span>{story.displayNarrator ?? story.narrator}</span>
          </div>

          <h2 className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl">
            {story.displayTitle ?? story.title}
          </h2>

          <p className="max-w-2xl text-lg leading-9 text-[#f8e8c4]/86">
            {story.displayPrompt ?? story.prompt}
          </p>

          {storyError && (
            <p className="max-w-2xl rounded-md border border-[#f4a8b8]/30 bg-[#2b111d]/48 px-4 py-3 text-sm leading-7 text-[#ffd9df]">
              {storyError}
            </p>
          )}
        </div>
      </div>

      <aside
        className={`grid gap-5 border-l border-[#f7d995]/22 pl-6 text-[#f8e8c4]/82 transition duration-600 ease-in-out
          ${isSwitchHovered ? "-translate-x-10" : ""}`}
      >
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
            體驗核心
          </p>
          <p className="text-sm leading-7">
            {story.displayDescription ?? story.description}
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
            <span>關鍵情緒</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
