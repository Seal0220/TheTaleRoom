const toneClassNames = {
  gold: "border-tale-gold/34 bg-tale-gold/10 text-[#ffe3a6]",
  rose: "border-tale-rose/34 bg-tale-rose/12 text-[#ffd7e4]",
  moss: "border-tale-moss/38 bg-tale-moss/12 text-[#d8f3dc]",
  ink: "border-white/12 bg-white/[0.06] text-tale-mist",
};

export function Pill({ children, tone = "gold" }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]
        ${toneClassNames[tone] ?? ""}`}
    >
      {children}
    </span>
  );
}
