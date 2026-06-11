"use client";

import { Button } from "@/components/ui/Button";
import { forwardRef, useRef } from "react";

export const StoryEntranceCard = forwardRef(function StoryEntranceCard(
  {
    index,
    isInactiveEntrance,
    isRaisedEntrance,
    onActivate,
    onEnter,
    onRelease,
    story,
  },
  ref,
) {
  const touchEnterLockRef = useRef(false);

  function handleEnterStory() {
    if (touchEnterLockRef.current) {
      return;
    }

    onEnter(story.id, index);
  }

  return (
    <div
      className={`relative lg:perspective-distant
        ${isRaisedEntrance ? "z-30" : "z-0"}`}
    >
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
        className="group relative flex min-h-90 rounded-[28px_28px_10px_10px] border border-tale-gold/34 bg-[#0c0d18]/36 text-left shadow-[0_24px_80px_rgba(0,0,0,0.46)] transition-[border-color,box-shadow] duration-500 ease-in-out hover:border-[#f7d995]/70 hover:shadow-[0_28px_90px_rgba(232,196,125,0.18)] lg:backface-hidden lg:translate-0 lg:rotate-0 lg:origin-center lg:transform-3d xl:min-h-140"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px_28px_10px_10px] bg-[#0c0d18]/72"
        >
          <span
            className="absolute inset-0 bg-cover bg-center opacity-[0.82] transition duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-100 group-focus-within:scale-105 group-focus-within:opacity-100"
            style={{
              backgroundImage: `url(${story.entryImage ?? story.backgroundImage})`,
            }}
          />
          <span
            className={`absolute inset-0 bg-linear-to-b mix-blend-multiply
              ${story.accent}`}
          />
          <span className="absolute inset-0 bg-linear-to-b from-[#090811]/16 via-[#090811]/50 to-[#070713]/86" />
          <span className="absolute -inset-12 bg-[radial-gradient(circle_at_50%_22%,rgba(255,231,170,0.34),transparent_36%),radial-gradient(circle_at_50%_84%,rgba(232,196,125,0.18),transparent_44%)] opacity-0 blur-2xl transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100" />
          <span className="absolute inset-0 rounded-[28px_28px_10px_10px] opacity-0 shadow-[inset_0_0_34px_rgba(255,232,182,0.28),0_0_42px_rgba(232,196,125,0.26)] transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-focus-within:opacity-100" />
          <span className="absolute inset-x-5 top-5 h-px bg-linear-to-r from-transparent via-[#f7d995]/76 to-transparent" />
          <span className="absolute inset-x-7 bottom-7 h-px bg-linear-to-r from-transparent via-[#f7d995]/52 to-transparent" />
          <span className="absolute left-1/2 top-5 h-20 w-px -translate-x-1/2 bg-linear-to-b from-[#f7d995]/60 to-transparent" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center justify-between px-5 py-8 text-center lg:perspective-[900px] lg:transform-3d">
          <span
            className={`grid h-12 w-12 place-items-center rounded-full border border-[#f7d995]/42 bg-[#100d16]/64 text-lg font-semibold text-[#f8e8c4] shadow-[0_0_26px_rgba(232,196,125,0.16)] transition-all duration-300 ease-in-out will-change-all
              ${isInactiveEntrance ? "lg:translate-z-0 lg:group-hover:translate-z-0 lg:group-focus-within:translate-z-0" : "lg:translate-z-3 lg:group-hover:translate-z-8 lg:group-focus-within:translate-z-8"}`}
          >
            {index + 1}
          </span>

          <div className="grid gap-4 transition-all duration-500 ease-in-out will-change-all lg:transform-3d">
            <p
              className={`text-2xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_2px_12px_rgba(0,0,0,0.72)] transition-all duration-800 ease-in-out will-change-all
                ${isInactiveEntrance ? "lg:translate-z-0 lg:group-hover:translate-z-0 lg:group-focus-within:translate-z-0" : "lg:translate-z-5 lg:group-hover:translate-z-12 lg:group-focus-within:translate-z-12"}`}
            >
              {story.title}
            </p>

            <div
              className={`grid gap-4 transition-transform duration-1200 ease-in-out
                ${isInactiveEntrance ? "lg:translate-z-0 lg:group-hover:translate-z-0 lg:group-focus-within:translate-z-0" : "lg:translate-z-2 lg:group-hover:translate-z-6 lg:group-focus-within:translate-z-6"}`}
            >
              {story.headImage && (
                <span className="mx-auto grid size-32 place-items-center overflow-hidden rounded-full drop-shadow-[0_0_26px_rgba(232,196,125,0.16)]">
                  <span
                    aria-label={story.narrator}
                    className="h-full w-full bg-cover bg-center"
                    role="img"
                    style={{
                      backgroundImage: `url(${story.headImage})`,
                    }}
                  />
                </span>
              )}
              <p className="text-sm font-medium tracking-[0.16em] text-[#f6d797]">
                {story.narrator}
              </p>
              <span className="mx-auto h-px w-20 bg-[#f7d995]/46" />
              <p className="text-sm leading-7 text-[#f8e8c4]/82">
                {story.theme}
              </p>
            </div>
          </div>

          <div className="pt-10">
            <Button
              onClick={handleEnterStory}
              arrowR
              className={`
                ${isInactiveEntrance ? "lg:translate-z-0 lg:group-hover:translate-z-0 lg:group-focus-within:translate-z-0" : "lg:translate-z-3 lg:group-hover:translate-z-6 lg:group-focus-within:translate-z-6"}`}
            >
              進入故事
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
});
