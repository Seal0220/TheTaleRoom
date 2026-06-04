export function StoryReturnZone({
  isActive,
  onBack,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
}) {
  return (
    <div
      aria-label="返回入口"
      className={`group/return absolute top-0 left-0 z-30 grid h-full w-[clamp(8rem,22vw,40rem)] cursor-pointer items-center justify-end overflow-hidden bg-linear-to-r from-[#f4c76b]/34 to-transparent pr-[clamp(1.5rem,6vw,12.5rem)] transition-opacity duration-500 ease-in-out before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-r before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:opacity-0 before:transition-opacity before:duration-700 before:ease-in-out before:content-[''] hover:before:opacity-100
        ${isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={onBack}
      onKeyDown={onKeyDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      role="button"
      tabIndex={0}
    >
      <div className="relative z-10 mt-12 h-fit w-fit select-none text-right">
        <span className="inline-block text-xs tracking-[0.32em] transition-all duration-[850ms] ease-in-out group-hover/return:tracking-[0.8em] sm:text-sm sm:tracking-[0.5em] sm:group-hover/return:tracking-[1.4em] xl:group-hover/return:tracking-[2em]">
          &lt;返回入口
        </span>
      </div>
    </div>
  );
}
