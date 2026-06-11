import { ArrowLeft, BookOpen } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { emotionLabels } from "../helpers/storyRoomLabels";

export function StoryIntroPanel({
  isSwitchHovered,
  onBack,
  onStart,
  story,
  storyError,
}) {
  const emotionTags = story.emotions.map((emotion) => emotionLabels[emotion] ?? emotion);

  return (
    <div className="mx-auto grid w-full shrink-0 gap-8 lg:max-w-3xl lg:gap-10 xl:max-w-none xl:grid-cols-2 xl:items-end xl:gap-[clamp(2rem,4vw,5rem)]">
      <div
        className={`grid gap-8 transition duration-800 ease-in-out xl:gap-8
          ${isSwitchHovered ? "-translate-x-6 xl:-translate-x-12" : ""}`}
      >
        <div className="sticky top-0 z-40 grid w-full gap-3 py-4 before:pointer-events-none before:absolute before:-top-8 before:left-1/2 before:z-0 before:h-32 before:w-screen before:-translate-x-1/2 before:bg-linear-to-b before:from-[#151515]/78 before:via-[#151515]/42 before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:-top-8 after:left-1/2 after:z-0 after:h-36 after:w-screen after:-translate-x-1/2 after:backdrop-blur-md after:[mask-image:linear-gradient(to_bottom,black_0%,black_48%,transparent_100%)] after:content-[''] md:flex md:items-center md:gap-5 md:before:hidden md:after:hidden lg:static lg:py-0">
          <button
            aria-label="返回入口"
            className="relative z-10 inline-flex h-9 w-fit items-center gap-2 rounded-md border border-[#f7d995]/34 bg-[#100b14]/62 px-3 -mx-1 mb-2 text-xs font-semibold tracking-[0.16em] text-[#ffe9b7] transition duration-300 hover:bg-tale-gold hover:text-[#130b12] md:mb-0"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="size-4" />
            返回入口
          </button>

          <div className="relative z-10 flex max-w-6xl flex-wrap items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#f6d797] sm:text-sm sm:tracking-[0.18em]">
            <BookOpen className="h-4 w-4" />
            <span>{story.displayNarrator ?? story.narrator}</span>
          </div>
        </div>

        <div className="grid max-w-3xl gap-5">
          <h2 className="min-w-0 max-w-full text-5xl font-semibold leading-tight wrap-break-word text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl">
            {story.displayTitle ?? story.title}
          </h2>

          <div className="flex flex-row items-center gap-3">
            {story.headImage && (
              <div className="relative size-12 sm:size-16 min-w-12 overflow-hidden drop-shadow-[0_0_30px_rgba(232,196,125,0.18)]">
                <Image
                  alt={story.displayNarrator ?? story.narrator}
                  className="object-cover"
                  fill
                  sizes="(min-width: 640px) 7rem, 6rem"
                  src={story.headImage}
                />
              </div>
            )}
            <p className="max-w-2xl text-lg leading-9 text-[#f8e8c4]/86">
              {story.displayPrompt ?? story.prompt}
            </p>
          </div>

          {storyError && (
            <p className="max-w-2xl rounded-md border border-[#f4a8b8]/30 bg-[#2b111d]/48 px-4 py-3 text-sm leading-7 text-[#ffd9df]">
              {storyError}
            </p>
          )}
        </div>
      </div>

      <aside
        className={`grid gap-5 border-t lg:max-w-90 border-[#f7d995]/22 pt-5 text-[#f8e8c4]/82 transition duration-600 ease-in-out md:grid-cols-2 md:gap-8 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6
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
                className="inline-flex h-9 items-center justify-center rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 text-center text-xs leading-none text-[#ffe9b7]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex justify-center pt-20 lg:hidden">
        <Button
          arrowR
          onClick={onStart}
        >
          開始故事
        </Button>
      </div>
    </div>
  );
}
