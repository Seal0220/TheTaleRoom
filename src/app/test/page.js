"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function Test() {
  const [hydrated, setHydrated] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [nativeCount, setNativeCount] = useState(0);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#050713] p-8 text-[#ffe9b7]">
      <div className="grid gap-6 text-center">
        <p className="text-xl font-semibold">
          React {hydrated ? "hydrated" : "not hydrated"}
        </p>

        <a
          className="pointer-events-auto relative z-50 inline-flex h-14 min-w-48 items-center justify-center rounded-md border border-[#f7d995] bg-[#241526] px-5 text-lg font-semibold text-[#ffe9b7] active:scale-[1.4] active:bg-[#e8c47d] active:text-[#130b12]"
          href="/test?native-link=1"
        >
          native link
        </a>

        <form action="/test?native-submit=1" method="get">
          <button
            className="pointer-events-auto relative z-50 h-14 min-w-48 rounded-md border border-[#f7d995] bg-[#241526] px-5 text-lg font-semibold active:scale-[1.4] active:bg-[#e8c47d] active:text-[#130b12]"
            type="submit"
          >
            native submit
          </button>
        </form>

        <button
          className="pointer-events-auto relative z-50 h-14 min-w-48 rounded-md border border-[#f7d995] bg-[#241526] px-5 text-lg font-semibold active:scale-[1.4] active:bg-[#e8c47d] active:text-[#130b12]"
          onClick={() => setNativeCount((count) => count + 1)}
          type="button"
        >
          native button
        </button>
        <p className="text-3xl font-semibold">
          native {nativeCount}
        </p>

        <Button onClick={() => setTapCount((count) => count + 1)}>
          shared Button
        </Button>
        <p className="text-4xl font-semibold">
          shared {tapCount}
        </p>

        <div className="text-sm leading-7 text-[#f8e8c4]/70">
          native active color changes without React. Count changes only after hydration.
        </div>
      </div>
    </main>
  );
}
