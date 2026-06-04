export function StoryAsideBlock({ children, title }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
        {title}
      </p>
      <div className="text-sm leading-7">
        {children}
      </div>
    </div>
  );
}

export function StorySummaryBlock({ children, title }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
        {title}
      </p>
      <p className="text-sm leading-7 text-[#f8e8c4]/78">
        {children}
      </p>
    </div>
  );
}
