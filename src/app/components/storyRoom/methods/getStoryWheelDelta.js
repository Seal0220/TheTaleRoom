export function getStoryWheelDelta(event) {
  const wheelDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
    ? event.deltaY
    : event.deltaX;

  return Math.abs(wheelDelta) < 18 ? 0 : wheelDelta;
}

export function getNextStageIndex({ currentIndex, stageCount, wheelDelta }) {
  const nextIndex = wheelDelta > 0 ? currentIndex + 1 : currentIndex - 1;

  return Math.min(stageCount - 1, Math.max(0, nextIndex));
}
