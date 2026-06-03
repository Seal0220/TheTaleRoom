"use client";

import { forwardRef } from "react";

export const StoryEntranceCard = forwardRef(function StoryEntranceCard(
  {
    index,
    isInactiveEntrance,
    isRaisedEntrance,
    onActivate,
    onRelease,
    story,
  },
  ref,
) {
  return (
    <div className={`relative perspective-distant ${isRaisedEntrance? "z-30": "z-0"}`}>
      <article
        ref={ref}
        onPointerEnter={() => onActivate(index)}
        onPointerLeave={onRelease}
        onFocus={() => onActivate(index)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            onRelease();
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
          <span className={`grid h-12 w-12 place-items-center rounded-full border border-[#f7d995]/42 bg-[#100d16]/64 text-lg font-semibold text-[#f8e8c4] shadow-[0_0_26px_rgba(232,196,125,0.16)] transition-all duration-300 ease-in-out will-change-all
            ${isInactiveEntrance? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0": "translate-z-3 group-hover:translate-z-8 group-focus-within:translate-z-8"}`}>
            {index + 1}
          </span>

          <div className="grid gap-4 transition-all duration-500 ease-in-out transform-3d will-change-all">
            <p className={`text-2xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.72)] transition-all duration-800 ease-in-out will-change-all
              ${isInactiveEntrance? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0": "translate-z-5 group-hover:translate-z-12 group-focus-within:translate-z-12"}`}>
              {story.title}
            </p>

            <div className={`grid gap-4 transition-transform duration-1200 ease-in-out
              ${isInactiveEntrance? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0": "translate-z-2 group-hover:translate-z-6 group-focus-within:translate-z-6"}`}>
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
            className={`relative z-30 cursor-pointer inline-flex h-10 min-w-32 items-center justify-center rounded-md border border-[#f7d995]/42 bg-[#110d14]/76 px-5 text-sm font-semibold text-[#ffe9b7] transition duration-500 ease-in-out will-change-all hover:bg-tale-gold hover:text-[#130b12] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#f7d995]
              ${isInactiveEntrance? "translate-z-0 group-hover:translate-z-0 group-focus-within:translate-z-0": "translate-z-3 group-hover:translate-z-6 group-focus-within:translate-z-6"}`}
          >
            進入故事
          </button>
        </div>
      </article>
    </div>
  );
});
