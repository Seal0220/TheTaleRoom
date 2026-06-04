export function StoryStartZone({
  isActive,
  isHovered,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onStart,
}) {
  return (
    <div
      aria-label="開始故事"
      className={`group/switch absolute top-0 right-0 z-30 grid h-full w-160 cursor-pointer items-center justify-start overflow-hidden bg-linear-to-l from-[#f4c76b]/34 to-transparent pl-50 transition-all duration-700 ease-in-out
        before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-l before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:transition-opacity before:duration-700 before:ease-in-out before:content-['']
        ${isHovered ? "before:opacity-100" : "before:opacity-0"}
        ${isActive ? "pointer-events-none translate-x-28 opacity-0" : "translate-x-0 opacity-100"}`}
      onClick={onStart}
      onKeyDown={onKeyDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      role="button"
      tabIndex={0}
    >
      <div className="relative z-10 mt-12 h-fit w-fit select-none text-left">
        <span className="inline-block tracking-[0.5em] transition-all duration-[850ms] ease-in-out group-hover/switch:tracking-[2em]">
          開始故事 &gt;
        </span>
      </div>
    </div>
  );
}
