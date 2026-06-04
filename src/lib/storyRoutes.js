export const storyRouteRoot = "/story";

export function buildStoryRoute(storyName) {
  return `${storyRouteRoot}/${encodeURIComponent(storyName)}`;
}

export function getStoryNameFromPathname(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length !== 2 || segments[0] !== "story" || !segments[1]) {
    return null;
  }

  return decodeURIComponent(segments[1]);
}
