"use client";

export function StoryRouteTransition({ active, phase, story }) {
  const isExitPhase = phase === "exit";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-50 grid place-items-center transition-opacity duration-700 ease-in-out
        ${active ? "opacity-100" : "opacity-0"}`}
    >
      <div className="absolute inset-0 bg-[#03040a]/76 backdrop-blur-md" />
      <div
        className={`absolute h-[120vmax] w-[120vmax] rounded-full border border-[#f7d995]/26 bg-[radial-gradient(circle,rgba(255,232,182,0.22)_0%,rgba(232,196,125,0.08)_24%,rgba(5,7,19,0.94)_58%,rgba(5,7,19,0)_72%)] shadow-[inset_0_0_90px_rgba(247,217,149,0.18),0_0_90px_rgba(232,196,125,0.18)] transition-all duration-900 ease-in-out
          ${active ? "scale-100 opacity-100" : "scale-50 opacity-0"}
          ${isExitPhase ? "rotate-12" : "-rotate-12"}`}
      />
      <div
        className={`relative grid gap-6 items-center text-center transition-all duration-500 ease-in-out
          ${active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      >
        <p className="text-sm font-semibold text-[#f6d797] tracking-[0.5em] ml-[0.5em]">
          {isExitPhase ? "闔上故事書" : "打開故事書"}
        </p>
        {!isExitPhase && (
          <p className="text-3xl font-semibold text-[#ffe9b7] drop-shadow-[0_3px_18px_rgba(0,0,0,0.78)] tracking-[1em] ml-[1em]">
            {story?.displayTitle ?? story?.title ?? ""}
          </p>
        )}
      </div>
    </div>
  );
}
