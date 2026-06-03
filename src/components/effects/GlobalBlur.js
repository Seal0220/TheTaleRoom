"use client";

export function GlobalBlur({
  active,
  blur = 8,
  opacity = 0.72,
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 bg-[#050713]/40 transition-[opacity,backdrop-filter,-webkit-backdrop-filter] duration-500 ease-out"
      style={{
        backdropFilter: active ? `blur(${blur}px)` : "blur(0px)",
        WebkitBackdropFilter: active ? `blur(${blur}px)` : "blur(0px)",
        opacity: active ? opacity : 0,
      }}
    />
  );
}
