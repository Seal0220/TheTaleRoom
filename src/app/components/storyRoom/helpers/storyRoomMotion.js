export function getHoverShiftStyle(duration) {
  return {
    transform: "translate3d(var(--stage-hover-shift), 0, 0)",
    transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: "transform",
  };
}

export function getDepthStageStyle(offset) {
  if (offset === 0) {
    return {
      filter: "blur(0px)",
      opacity: 1,
      pointerEvents: "auto",
      transform: "translate3d(0, 0, 0) scale(1)",
      zIndex: 3,
    };
  }

  if (offset < 0) {
    return {
      filter: "blur(8px)",
      opacity: 0,
      pointerEvents: "none",
      transform: "translate3d(0, 0, -520px) scale(0.84)",
      zIndex: 1,
    };
  }

  return {
    filter: "blur(10px)",
    opacity: 0,
    pointerEvents: "none",
    transform: "translate3d(0, 0, 420px) scale(1.12)",
    zIndex: 2,
  };
}
