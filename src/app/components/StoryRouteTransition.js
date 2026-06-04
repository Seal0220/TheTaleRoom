"use client";

import { cx } from "@/lib/classNames";

export function StoryRouteTransition({ active, phase, story }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "pointer-events-none fixed inset-0 z-50 grid place-items-center transition-opacity duration-700 ease-in-out",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-[#03040a]/76 backdrop-blur-md" />
      <div
        className={cx(
          "absolute h-[120vmax] w-[120vmax] rounded-full border border-[#f7d995]/26 bg-[radial-gradient(circle,rgba(255,232,182,0.22)_0%,rgba(232,196,125,0.08)_24%,rgba(5,7,19,0.94)_58%,rgba(5,7,19,0)_72%)] shadow-[inset_0_0_90px_rgba(247,217,149,0.18),0_0_90px_rgba(232,196,125,0.18)] transition-all duration-[900ms] ease-in-out",
          active ? "scale-100 opacity-100" : "scale-50 opacity-0",
          phase === "exit" ? "rotate-12" : "-rotate-12",
        )}
      />
      <div
        className={cx(
          "relative grid gap-3 text-center transition-all duration-500 ease-in-out",
          active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <p className="text-sm font-semibold tracking-[0.22em] text-[#f6d797]">
          {phase === "exit" ? "RETURNING" : "ENTERING"}
        </p>
        <p className="text-3xl font-semibold text-[#ffe9b7] drop-shadow-[0_3px_18px_rgba(0,0,0,0.78)]">
          {story?.displayTitle ?? story?.title ?? ""}
        </p>
      </div>
    </div>
  );
}
