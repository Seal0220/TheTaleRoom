import { ArrowRight, DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { cx } from "@/lib/classNames";

const accentClassNames = {
  rose: "from-[#3a1523] via-[#271526] to-[#111728] border-[#d982a4]/36",
  violet: "from-[#21123b] via-[#181633] to-[#101627] border-[#9f7aea]/36",
  gold: "from-[#3a2a12] via-[#251d16] to-[#0e1525] border-[#e8c47d]/40",
  umber: "from-[#2a1c16] via-[#171412] to-[#0b0f17] border-[#b88754]/40",
};

export function StoryPortalGrid({ stories }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stories.map((story, index) => (
        <article
          key={story.id}
          className={cx(
            "tale-frame flex min-h-[430px] flex-col justify-between overflow-hidden rounded-lg bg-linear-to-b p-5",
            accentClassNames[story.accent],
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/16 bg-white/10 text-tale-gold">
              <DoorOpen className="h-5 w-5" />
            </span>
            <span className="text-5xl font-semibold text-white/12">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="grid gap-4">
            <div>
              <h3 className="text-3xl font-semibold leading-tight text-[#fff4d6]">
                {story.title}
              </h3>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-tale-gold">
                {story.narrator}
              </p>
            </div>
            <p className="min-h-[84px] text-sm leading-7 text-tale-mist">
              {story.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {story.emotions.map((emotion) => (
                <Pill key={emotion} tone="ink">
                  {emotion}
                </Pill>
              ))}
            </div>
          </div>

          <Button href={`/studio?story=${story.id}`} variant="secondary">
            Enter story
            <ArrowRight className="h-4 w-4" />
          </Button>
        </article>
      ))}
    </div>
  );
}
