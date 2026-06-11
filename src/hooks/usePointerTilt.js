"use client";

import { useEffect, useRef } from "react";

const idlePointer = {
  panX: 0,
  panY: 0,
  tiltX: 0,
  tiltY: 0,
};

function createTiltState() {
  return {
    tiltX: 0,
    tiltY: 0,
    lift: 0,
  };
}

export function usePointerTilt({
  backgroundRef,
  itemRefs,
  itemCount = 0,
  activeIndex = null,
  backgroundBleed = 2.5,
  maxTilt = 11,
  activeLift = -0.5,
  backgroundSmoothing = 0.075,
  tiltSmoothing = 0.11,
  liftSmoothing = 0.12,
} = {}) {
  const pointerRef = useRef(idlePointer);
  const backgroundPanRef = useRef({ panX: 0, panY: 0 });
  const tiltRefs = useRef([]);
  const activeIndexRef = useRef(activeIndex);
  const animationRef = useRef(null);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    tiltRefs.current = Array.from(
      { length: itemCount },
      (_, index) => tiltRefs.current[index] ?? createTiltState(),
    );
  }, [itemCount]);

  useEffect(() => {
    const canHoverPrecisely = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!canHoverPrecisely) {
      if (backgroundRef?.current) {
        backgroundRef.current.style.transform = "";
      }

      itemRefs?.current?.forEach((item) => {
        if (item) {
          item.style.transform = "";
        }
      });

      return;
    }

    function resetPointer() {
      pointerRef.current = idlePointer;
    }

    function handlePointerMove(event) {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      const x = event.clientX / width;
      const y = event.clientY / height;

      pointerRef.current = {
        panX: (0.5 - x) * backgroundBleed * 2,
        panY: (0.5 - y) * backgroundBleed * 2,
        tiltX: (0.5 - y) * maxTilt * 2,
        tiltY: (x - 0.5) * maxTilt * 2,
      };
    }

    function tick() {
      const current = backgroundPanRef.current;
      const target = pointerRef.current;

      current.panX += (target.panX - current.panX) * backgroundSmoothing;
      current.panY += (target.panY - current.panY) * backgroundSmoothing;

      if (backgroundRef?.current) {
        backgroundRef.current.style.transform = `translate3d(${current.panX}vw, ${current.panY}vh, 0)`;
      }

      itemRefs?.current?.forEach((item, index) => {
        if (!item) {
          return;
        }

        const tilt = tiltRefs.current[index] ?? createTiltState();
        tiltRefs.current[index] = tilt;

        const targetLift = activeIndexRef.current === index ? activeLift : 0;

        tilt.tiltX += (target.tiltX - tilt.tiltX) * tiltSmoothing;
        tilt.tiltY += (target.tiltY - tilt.tiltY) * tiltSmoothing;
        tilt.lift += (targetLift - tilt.lift) * liftSmoothing;

        item.style.transform = `translate3d(0, ${tilt.lift}rem, 0) rotateX(${tilt.tiltX}deg) rotateY(${tilt.tiltY}deg)`;
      });

      animationRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    activeLift,
    backgroundRef,
    backgroundBleed,
    backgroundSmoothing,
    itemRefs,
    liftSmoothing,
    maxTilt,
    tiltSmoothing,
  ]);
}
