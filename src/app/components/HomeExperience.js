"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { GlobalBlur } from "@/components/effects/GlobalBlur";
import { storyCatalog, getStoryById, getStoryByRouteName } from "@/config/storyCatalog";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { buildStoryRoute, getStoryNameFromPathname } from "@/lib/storyRoutes";
import { StoryEntranceCard } from "./StoryEntranceCard";
import { StoryRoomView } from "./StoryRoomView";
import { StoryRouteTransition } from "./StoryRouteTransition";

const storyEntrances = storyCatalog.map((story) => ({
  ...story,
  title: story.displayTitle ?? story.title,
  narrator: story.displayNarrator ?? story.narrator,
  theme: story.displayTheme ?? story.theme,
  accent: story.entranceAccent,
}));

const backgroundBleed = 2.5;
const maxTilt = 11;
const zIndexReleaseDelay = 800;
const contentFadeDuration = 500;
const contentFadeInDelay = 40;
const routeTransitionDuration = 1200;

export function HomeExperience({ initialStoryId = null }) {
  const initialStory = getStoryById(initialStoryId);
  const backgroundRef = useRef(null);
  const cardRefs = useRef([]);
  const releaseTimerRef = useRef(null);
  const transitionTimersRef = useRef([]);
  const selectedStoryIdRef = useRef(initialStory?.id ?? null);
  const [hoveredEntrance, setHoveredEntrance] = useState(null);
  const [raisedEntrance, setRaisedEntrance] = useState(null);
  const [selectedStoryId, setSelectedStoryId] = useState(initialStory?.id ?? null);
  const [storyContentVisible, setStoryContentVisible] = useState(Boolean(initialStory));
  const [routeTransition, setRouteTransition] = useState(null);

  usePointerTilt({
    backgroundRef,
    itemRefs: cardRefs,
    itemCount: storyEntrances.length,
    activeIndex: hoveredEntrance,
    backgroundBleed,
    maxTilt,
  });

  useEffect(() => {
    selectedStoryIdRef.current = selectedStoryId;
  }, [selectedStoryId]);

  const clearReleaseTimer = useCallback(() => {
    if (releaseTimerRef.current) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  }, []);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    transitionTimersRef.current = [];
  }, []);

  const beginStoryTransition = useCallback(
    (nextStoryId, options = {}) => {
      const nextStory = nextStoryId ? getStoryById(nextStoryId) : null;
      const currentStoryId = selectedStoryIdRef.current;

      if (nextStoryId && !nextStory) {
        return;
      }

      if (currentStoryId === nextStoryId) {
        setRouteTransition(null);
        return;
      }

      const transitionStoryId = nextStoryId ?? currentStoryId;

      if (!transitionStoryId) {
        return;
      }

      clearReleaseTimer();
      clearTransitionTimers();

      const phase = nextStoryId ? "enter" : "exit";
      setRouteTransition({ active: true, phase, storyId: transitionStoryId });
      setStoryContentVisible(false);

      if (Number.isInteger(options.entranceIndex)) {
        setHoveredEntrance(options.entranceIndex);
        setRaisedEntrance(options.entranceIndex);
      }

      transitionTimersRef.current.push(
        window.setTimeout(() => {
          setHoveredEntrance(null);

          if (nextStoryId) {
            selectedStoryIdRef.current = nextStoryId;
            setSelectedStoryId(nextStoryId);
          }
        }, contentFadeDuration),
      );

      transitionTimersRef.current.push(
        window.setTimeout(() => {
          if (nextStoryId) {
            transitionTimersRef.current.push(
              window.setTimeout(() => {
                setStoryContentVisible(true);
              }, contentFadeInDelay),
            );
          } else {
            selectedStoryIdRef.current = null;
            setSelectedStoryId(null);
          }

          setRouteTransition((currentTransition) =>
            currentTransition ? { ...currentTransition, active: false } : null,
          );
          setRaisedEntrance(null);
        }, routeTransitionDuration),
      );
    },
    [clearReleaseTimer, clearTransitionTimers],
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    function handlePopState() {
      const storyNameFromPath = getStoryNameFromPathname(window.location.pathname);
      const validStory = storyNameFromPath ? getStoryByRouteName(storyNameFromPath) : null;
      beginStoryTransition(validStory?.id ?? null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [beginStoryTransition]);

  useEffect(() => {
    return () => {
      clearReleaseTimer();
      clearTransitionTimers();
    };
  }, [clearReleaseTimer, clearTransitionTimers]);

  function writeRoute(pathname) {
    if (typeof window === "undefined") {
      return;
    }

    const search = window.location.search || "";
    const nextUrl = `${pathname}${search}`;

    if (window.location.pathname !== pathname || window.location.search !== search) {
      window.history.pushState(null, "", nextUrl);
    }
  }

  function activateEntrance(index) {
    clearReleaseTimer();
    setHoveredEntrance(index);
    setRaisedEntrance(index);
  }

  function releaseEntrance() {
    clearReleaseTimer();
    setHoveredEntrance(null);
    releaseTimerRef.current = window.setTimeout(() => {
      setRaisedEntrance(null);
      releaseTimerRef.current = null;
    }, zIndexReleaseDelay);
  }

  function enterStory(storyId, index) {
    const story = getStoryById(storyId);

    if (!story) {
      return;
    }

    writeRoute(buildStoryRoute(story.displayTitle ?? story.title));
    beginStoryTransition(story.id, { entranceIndex: index });
  }

  function returnToEntrance() {
    writeRoute("/");
    beginStoryTransition(null);
  }

  const selectedStory = getStoryById(selectedStoryId);
  const transitionStory = getStoryById(routeTransition?.storyId ?? selectedStoryId);
  const isTransitioning = Boolean(routeTransition?.active);
  const isHomeSuppressed =
    Boolean(selectedStory) || Boolean(routeTransition?.active && routeTransition.phase === "enter");
  const isStoryVisible =
    Boolean(selectedStory) && storyContentVisible && routeTransition?.phase !== "exit";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050713] text-[#f8e8c4]">
      <div
        ref={backgroundRef}
        className="absolute inset-x-[-6vw] inset-y-[-6vh] will-change-all"
        style={{ transform: "translate3d(0, 0, 0)" }}
      >
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          sizes="112vw"
          className="object-cover blur-xs"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_45%,rgba(247,190,88,0.08),transparent_24%),linear-gradient(90deg,rgba(3,5,13,0.05),rgba(3,5,13,0.16)_42%,rgba(3,5,13,0.62))]" />

      <GlobalBlur
        active={hoveredEntrance !== null || isTransitioning}
        blur={isTransitioning ? 28 : 16}
      />

      <section
        className={`relative flex min-h-screen items-center px-5 py-10 transition-all duration-500 ease-in-out sm:px-8 lg:px-12
          ${isHomeSuppressed ? "pointer-events-none scale-[1.03] opacity-0 blur-sm" : "pointer-events-auto opacity-100"}`}
      >
        <div className="mx-auto flex w-full max-w-400 flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-xl flex-col items-center justify-center text-left lg:max-w-120">
            <div className="mb-5 h-px w-40 bg-linear-to-r from-[#f7d995]/0 via-[#f7d995]/76 to-[#f7d995]/0 lg:w-56" />
            <h1 className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_3px_18px_rgba(0,0,0,0.72)] sm:text-6xl lg:text-7xl">
              AI 情緒故事館
            </h1>
            <p className="mt-5 text-base font-medium tracking-[0.18em] text-[#f6d797] sm:text-lg">
              走進四個故事，聽見不同階段的自己
            </p>
          </div>

          <div className="relative ml-auto grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {storyEntrances.map((story, index) => {
              const isInactiveEntrance = hoveredEntrance !== null && hoveredEntrance !== index;

              return (
                <StoryEntranceCard
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  index={index}
                  isInactiveEntrance={isInactiveEntrance}
                  isRaisedEntrance={raisedEntrance === index}
                  key={story.id}
                  onActivate={activateEntrance}
                  onEnter={enterStory}
                  onRelease={releaseEntrance}
                  story={story}
                />
              );
            })}
          </div>
        </div>
      </section>

      <StoryRoomView
        isVisible={isStoryVisible}
        onBack={returnToEntrance}
        story={selectedStory}
      />
      <StoryRouteTransition
        active={isTransitioning}
        phase={routeTransition?.phase}
        story={transitionStory}
      />
    </main>
  );
}
