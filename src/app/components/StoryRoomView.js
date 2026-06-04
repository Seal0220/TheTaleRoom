"use client";

import { BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

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
  const [isSwitchHovered, setIsSwitchHovered] = useState(false);

  if (!story) {
    return null;
  }

  return (
    <section
      aria-hidden={!isVisible}
      aria-live="polite"
      className={`absolute inset-0 z-20 flex min-h-screen items-center px-5 py-10 transition-all duration-500 ease-in-out sm:px-8 lg:px-12
        ${isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-8 opacity-0"}`}
    >
      <div
        onPointerEnter={() => setIsSwitchHovered(true)}
        onPointerLeave={() => setIsSwitchHovered(false)}
        className={`group/switch absolute top-0 right-0 z-10 grid h-full w-160 cursor-pointer items-center justify-start overflow-hidden bg-linear-to-l from-[#f4c76b]/34 to-transparent pl-50 
          before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-l before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:transition-opacity before:duration-700 before:ease-in-out before:content-['']
          ${isSwitchHovered ? "before:opacity-100" : "before:opacity-0"}`}
      >
        <div className="relative z-10 mt-12 h-fit w-fit select-none text-left">
          <span className="inline-block tracking-[0.5em] transition-all duration-850 group-hover/switch:tracking-[2em]">開始故事 &gt;</span>
        </div>
      </div>


      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(255,231,170,0.14),transparent_28%),linear-gradient(180deg,rgba(5,7,19,0.24),rgba(5,7,19,0.88))] before:absolute before:inset-x-[-20vw] before:top-[-35vh] before:h-[70vh] before:bg-linear-to-b before:blur-3xl before:content-['']
          ${accentAuraClassNames[story.accent]}`}
      />

      <div className="relative ml-auto mr-160 grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
        <div className={`grid gap-8 transition duration-800 ease-in-out ${isSwitchHovered ? "-translate-x-12" : ""}`}>
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
          </div>
        </div>

        <aside
          className={`grid gap-5 border-l border-[#f7d995]/22 text-[#f8e8c4]/82 transition duration-600 ease-in-out
            ${isSwitchHovered ? "-translate-x-20" : ""}`}
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
              {story.emotions.map((emotion) => (
                <span
                  key={emotion}
                  className="rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
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
