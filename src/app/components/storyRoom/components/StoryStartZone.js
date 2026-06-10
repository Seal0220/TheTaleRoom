export function StoryStartZone({
  isActive,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onStart,
}) {
  return (
    <div
      aria-label="開始故事"
      className={`group/switch absolute right-0 bottom-0 z-30 grid h-24 w-full cursor-pointer items-center justify-center overflow-hidden bg-linear-to-t from-[#f4c76b]/34 to-transparent px-6 transition-all duration-700 ease-in-out 
        md:top-0 md:right-0 md:bottom-auto md:h-full md:w-[clamp(8rem,22vw,30rem)] md:bg-linear-to-l
        before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-t before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:opacity-0 before:transition-opacity before:duration-700 before:ease-in-out before:content-[''] hover:before:opacity-100 md:before:bg-linear-to-l
        ${isActive ? "pointer-events-none translate-y-10 opacity-0 md:translate-x-28 md:translate-y-0" : "translate-x-0 translate-y-0 opacity-100"}`}
      onClick={onStart}
      onKeyDown={onKeyDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      role="button"
      tabIndex={0}
    >
      <div className="relative z-10 h-fit w-[clamp(11rem,46vw,18rem)] select-none text-left md:mt-12 md:w-[clamp(11rem,16vw,18rem)] ml-[20%]">
        <span className="inline-block whitespace-nowrap text-xs tracking-[0.32em] transition-all duration-850 ease-in-out group-hover/switch:tracking-[0.8em]
          sm:text-sm sm:tracking-[0.5em] sm:group-hover/switch:tracking-[1.4em] lg:group-hover/switch:tracking-[0.9em]">
          開始故事 &gt;
        </span>
      </div>
    </div>
  );
}
