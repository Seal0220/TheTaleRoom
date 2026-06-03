"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GlobalBlur } from "@/components/effects/GlobalBlur";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { StoryEntranceCard } from "./components/StoryEntranceCard";

const storyEntrances = [
  {
    title: "灰姑娘",
    narrator: "說書人 · 玻璃鞋",
    theme: "被看見 · 被愛 · 童話幻境",
    accent: "from-[#f4a8b8]/34 via-[#cf6f93]/18 to-[#2c1734]/82",
  },
  {
    title: "愛麗絲夢遊仙境",
    narrator: "說書人 · 柴郡貓",
    theme: "迷惘 · 自我認同 · 混亂夢境",
    accent: "from-[#8d63ff]/34 via-[#542b8f]/22 to-[#16183f]/86",
  },
  {
    title: "小王子",
    narrator: "說書人 · 狐狸",
    theme: "羈絆 · 想念 · 離別與成長",
    accent: "from-[#f4c76b]/38 via-[#a56a31]/18 to-[#111b35]/84",
  },
  {
    title: "國王的新衣",
    narrator: "說書人 · 裁縫師",
    theme: "虛偽 · 真相 · 成人世界",
    accent: "from-[#8a6a4f]/32 via-[#3c2c2a]/22 to-[#0c0d12]/90",
  },
];

const backgroundBleed = 2.5;
const maxTilt = 11;
const zIndexReleaseDelay = 800;

export default function HomePage() {
  const backgroundRef = useRef(null);
  const cardRefs = useRef([]);
  const releaseTimerRef = useRef(null);
  const [hoveredEntrance, setHoveredEntrance] = useState(null);
  const [raisedEntrance, setRaisedEntrance] = useState(null);

  usePointerTilt({
    backgroundRef,
    itemRefs: cardRefs,
    itemCount: storyEntrances.length,
    activeIndex: hoveredEntrance,
    backgroundBleed,
    maxTilt,
  });

  useEffect(() => {
    return () => {
      if (releaseTimerRef.current) {
        window.clearTimeout(releaseTimerRef.current);
      }
    };
  }, []);

  function clearReleaseTimer() {
    if (releaseTimerRef.current) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }

  function activateEntrance(index) {
    clearReleaseTimer();
    setHoveredEntrance(index);
    setRaisedEntrance(index);
  }

  function releaseEntrance() {
    clearReleaseTimer();
    setHoveredEntrance(null);
    releaseTimerRef.current = window.setTimeout(() => {
      setRaisedEntrance(null);
      releaseTimerRef.current = null;
    }, zIndexReleaseDelay);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050713] text-[#f8e8c4]">
      <div
        ref={backgroundRef}
        className="absolute inset-x-[-6vw] inset-y-[-6vh] will-change-all"
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          sizes="112vw"
          className="object-cover blur-xs"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_45%,rgba(247,190,88,0.08),transparent_24%),linear-gradient(90deg,rgba(3,5,13,0.05),rgba(3,5,13,0.16)_42%,rgba(3,5,13,0.62))]" />

      <GlobalBlur active={hoveredEntrance !== null} blur={20} />

      <section className="relative flex min-h-screen items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-400 flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col justify-center items-center max-w-xl text-left lg:max-w-120">
            <div className="mb-5 h-px w-40 bg-linear-to-r from-[#f7d995]/0 via-[#f7d995]/76 to-[#f7d995]/0 lg:w-56" />
            <h1 className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_3px_18px_rgba(0,0,0,0.72)] sm:text-6xl lg:text-7xl">
              AI 情緒故事館
            </h1>
            <p className="mt-5 text-base font-medium tracking-[0.18em] text-[#f6d797] sm:text-lg">
              走進四個故事，聽見不同階段的自己
            </p>
          </div>

          <div className="relative ml-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {storyEntrances.map((story, index) => {
              const isInactiveEntrance = hoveredEntrance !== null && hoveredEntrance !== index;

              return (
                <StoryEntranceCard
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  index={index}
                  isInactiveEntrance={isInactiveEntrance}
                  isRaisedEntrance={raisedEntrance === index}
                  key={story.title}
                  onActivate={activateEntrance}
                  onRelease={releaseEntrance}
                  story={story}
                />
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
