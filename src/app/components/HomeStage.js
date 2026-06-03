"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GlobalBlur } from "@/components/effects/GlobalBlur";
import { usePointerTilt } from "@/hooks/usePointerTilt";

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

export function HomeStage() {
  const backgroundRef = useRef(null);
  const cardRefs = useRef([]);
  const [hoveredEntrance, setHoveredEntrance] = useState(null);

  usePointerTilt({
    backgroundRef,
    itemRefs: cardRefs,
    itemCount: storyEntrances.length,
    activeIndex: hoveredEntrance,
    backgroundBleed,
    maxTilt,
  });

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

          <div
            className="relative ml-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {storyEntrances.map((story, index) => {
              const isInactiveEntrance = hoveredEntrance !== null && hoveredEntrance !== index;

              return (
                <div
                  key={story.title}
                  className={`relative perspective-distant
                    ${isInactiveEntrance ? "z-0" : "z-30"}`}
                >
                  <article
                    ref={(node) => {
                      cardRefs.current[index] = node;
                    }}
                    onPointerEnter={() => setHoveredEntrance(index)}
                    onPointerLeave={() => setHoveredEntrance(null)}
                    onFocus={() => setHoveredEntrance(index)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setHoveredEntrance(null);
                      }
                    }}
                    className="group relative flex min-h-90 rounded-[28px_28px_10px_10px] border border-tale-gold/34 bg-[#0c0d18]/36 text-left shadow-[0_24px_80px_rgba(0,0,0,0.46)] transition-[border-color,box-shadow] duration-500 ease-in-out backface-hidden translate-0 rotate-0 origin-center transform-3d hover:border-[#f7d995]/70 hover:shadow-[0_28px_90px_rgba(232,196,125,0.18)]"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px_28px_10px_10px] bg-[#0c0d18]/72"
                    >
                      <span className={`absolute inset-0 bg-linear-to-b ${story.accent}`} />
                      <span className="absolute -inset-12 bg-[radial-gradient(circle_at_50%_22%,rgba(255,231,170,0.34),transparent_36%),radial-gradient(circle_at_50%_84%,rgba(232,196,125,0.18),transparent_44%)] opacity-0 blur-2xl transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100" />
                      <span className="absolute inset-0 rounded-[28px_28px_10px_10px] opacity-0 shadow-[inset_0_0_34px_rgba(255,232,182,0.28),0_0_42px_rgba(232,196,125,0.26)] transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100" />
                      <span className="absolute inset-x-5 top-5 h-px bg-linear-to-r from-transparent via-[#f7d995]/76 to-transparent" />
                      <span className="absolute inset-x-7 bottom-7 h-px bg-linear-to-r from-transparent via-[#f7d995]/52 to-transparent" />
                      <span className="absolute left-1/2 top-5 h-20 w-px -translate-x-1/2 bg-linear-to-b from-[#f7d995]/60 to-transparent" />
                    </div>

                    <div className="relative z-10 flex w-full flex-col items-center justify-between px-5 py-8 text-center perspective-[900px] transform-3d">
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-full border border-[#f7d995]/42 bg-[#100d16]/64 text-lg font-semibold text-[#f8e8c4] shadow-[0_0_26px_rgba(232,196,125,0.16)] transition-all duration-300 ease-in-out will-change-all
                      ${isInactiveEntrance ? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0" : "translate-z-3 group-hover:translate-z-8 group-focus-within:translate-z-8"}`}
                      >
                        {index + 1}
                      </span>

                      <div className={`grid gap-4 transition-all duration-500 ease-in-out transform-3d will-change-all`} >
                        <p
                          className={`text-2xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.72)] transition-all duration-800 ease-in-out will-change-all
                        ${isInactiveEntrance ? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0" : "translate-z-5 group-hover:translate-z-12 group-focus-within:translate-z-12"}`}
                        >
                          {story.title}
                        </p>

                        <div className={`grid gap-4 transition-transform duration-200 ease-in-out ${isInactiveEntrance ? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0" : "translate-z-2 group-hover:translate-z-4 group-focus-within:translate-z-4"}`} >
                          <p className="text-sm font-medium tracking-[0.16em] text-[#f6d797]">
                            {story.narrator}
                          </p>
                          <span className="mx-auto h-px w-20 bg-[#f7d995]/46" />
                          <p className="text-sm leading-7 text-[#f8e8c4]/82">
                            {story.theme}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`relative z-30 inline-flex h-10 min-w-32 items-center justify-center rounded-md border border-[#f7d995]/42 bg-[#110d14]/76 px-5 text-sm font-semibold text-[#ffe9b7] transition duration-500 ease-in-out will-change-all hover:bg-tale-gold hover:text-[#130b12] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#f7d995]
                      ${isInactiveEntrance ? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0" : "translate-z-3 group-hover:translate-z-6 group-focus-within:translate-z-6"}`}
                      >
                        進入故事
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
