"use client";

import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { cx } from "@/lib/classNames";

const accentAuraClassNames = {
  rose: "from-[#f4a8b8]/22 via-[#cf6f93]/10 to-transparent",
  violet: "from-[#8d63ff]/24 via-[#44b7d7]/10 to-transparent",
  gold: "from-[#f4c76b]/24 via-[#7da083]/10 to-transparent",
  umber: "from-[#b88754]/24 via-[#7d8aa0]/10 to-transparent",
};

const emotionLabels = {
  neglect: "被忽略",
  hope: "希望",
  recognition: "被認出",
  confusion: "迷惘",
  identity: "自我",
  curiosity: "好奇",
  loneliness: "孤單",
  care: "在乎",
  growth: "成長",
  pressure: "壓力",
  truth: "真相",
  courage: "勇氣",
};

export function StoryRoomView({ isVisible, onBack, story }) {
  if (!story) {
    return null;
  }

  return (
    <section
      aria-hidden={!isVisible}
      aria-live="polite"
      className={cx(
        "absolute inset-0 z-20 flex min-h-screen items-center px-5 py-10 transition-all duration-500 ease-in-out sm:px-8 lg:px-12",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0",
      )}
    >
      <div
        aria-hidden="true"
        className={cx(
          "absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,231,170,0.14),transparent_28%),linear-gradient(180deg,rgba(5,7,19,0.24),rgba(5,7,19,0.88))]",
          "before:absolute before:inset-x-[-20vw] before:top-[-35vh] before:h-[70vh] before:bg-linear-to-b before:blur-3xl before:content-['']",
          accentAuraClassNames[story.accent],
        )}
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className="grid gap-8">
          <button
            type="button"
            onClick={onBack}
            className="tale-focus inline-flex h-11 w-fit items-center gap-2 rounded-md border border-[#f7d995]/32 bg-[#080b14]/46 px-4 text-sm font-semibold text-[#ffe9b7] transition hover:border-[#f7d995]/72 hover:bg-[#f7d995]/12"
          >
            <ArrowLeft className="h-4 w-4" />
            返回入口
          </button>

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
          </div>
        </div>

        <aside className="grid gap-5 border-l border-[#f7d995]/22 pl-6 text-[#f8e8c4]/82">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
              Story Thread
            </p>
            <p className="text-sm leading-7">
              {story.displayDescription ?? story.description}
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
              <Sparkles className="h-4 w-4" />
              <span>Emotional Keys</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {story.emotions.map((emotion) => (
                <span
                  key={emotion}
                  className="rounded-md border border-[#f7d995]/22 bg-[#080b14]/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
                >
                  {emotionLabels[emotion] ?? emotion}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
