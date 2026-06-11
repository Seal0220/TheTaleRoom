"use client";

import { BookOpen, Send } from "lucide-react";
import { useRef, useState } from "react";

const previewStages = [
  {
    checkpoint: "階段 1",
    detail: "廚房壁爐旁 · 孤獨、壓抑、微弱的渴望",
    objects: ["爐灰", "破舊裙襬", "遠方舞會音樂"],
    phase: "說書人 · 玻璃鞋 · 開場",
    prompt:
      "如果你是灰姑娘，此刻你會讓她做什麼？她會把願望說出口、把它藏起來，還是做出一個誰也想不到的舉動？",
    text:
      "夜色慢慢落進屋子，壁爐裡只剩細小的紅光。灰姑娘跪在爐灰旁，指尖沾著灰，像握著一些還不能說出口的委屈。樓上的笑聲和舞會的消息一起傳來，她低頭看著破舊裙襬，心裡有一個很小、很安靜的願望，還不敢被任何人聽見。",
    title: "爐灰旁的夜晚",
  },
  {
    checkpoint: "階段 2",
    detail: "廚房壁爐旁 · 安靜的反抗、自我奪回",
    objects: ["燒掉的邀請函", "爐火", "灰燼"],
    phase: "說書人 · 玻璃鞋 · 初始衝突",
    prompt:
      "火光熄下來後，灰姑娘第一次感覺到自己並不只是等待被選中的人。接下來，她會走向哪裡？",
    text:
      "灰姑娘把那張皺起的邀請函靠近火光。紙邊先是捲曲，然後安靜地亮起來，像一隻終於不再等待命令的鳥。她沒有哭，也沒有喊叫，只是看著那些字變成灰。那一刻，舞會不再只是別人允許她進入的地方，而變成一個她必須重新命名的遠方。",
    title: "燒掉的邀請函",
  },
  {
    checkpoint: "階段 3",
    detail: "深夜花園 · 猶豫、恐懼、想被看見",
    objects: ["星空", "南瓜藤", "小鳥羽毛"],
    phase: "說書人 · 玻璃鞋 · 情緒投射",
    prompt:
      "當花園把她藏起來，也把她照亮時，你想讓灰姑娘說出哪一句話？",
    text:
      "她走到花園時，夜裡的風把裙襬吹得很輕。小鳥停在南瓜藤上，像守著一個還沒成形的祕密。灰姑娘摸著手上的灰，忽然明白自己不是不想去舞會，而是不想再用別人的允許證明自己可以被愛。",
    title: "不尋常的夜晚",
  },
];

export function StoryStagePagerTest() {
  const wheelLockRef = useRef(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isReturnHovered, setIsReturnHovered] = useState(false);
  const phasePrefix = "說書人 · 玻璃鞋";
  const phaseNames = previewStages.map((stage) =>
    stage.phase.replace(`${phasePrefix} · `, ""),
  );
  const stageNumbers = previewStages.map((_, index) => `${index + 1}`);
  const stageGutter = "clamp(1rem, 3vw, 3rem)";
  const stageOffset = "clamp(5.5rem, 28vw, 25rem)";
  const stageHoverShift = isReturnHovered
    ? "clamp(1.25rem, 2vw, 2rem)"
    : "0rem";
  const stageWidth =
    "calc(100vw - var(--stage-offset) - var(--stage-gutter) - var(--stage-gutter))";
  const progressPercent =
    previewStages.length > 1
      ? (activeStageIndex / (previewStages.length - 1)) * 100
      : 100;

  function handleWheel(event) {
    event.preventDefault();

    if (wheelLockRef.current) {
      return;
    }

    const wheelDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

    if (Math.abs(wheelDelta) < 18) {
      return;
    }

    wheelLockRef.current = true;
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 760);

    setActiveStageIndex((currentIndex) => {
      const nextIndex = wheelDelta > 0 ? currentIndex + 1 : currentIndex - 1;

      return Math.min(previewStages.length - 1, Math.max(0, nextIndex));
    });
  }

  return (
    <section
      className="relative h-screen overflow-hidden bg-[#050713] text-[#f8e8c4]"
      onWheel={handleWheel}
      style={{
        "--stage-gutter": stageGutter,
        "--stage-hover-shift": stageHoverShift,
        "--stage-offset": stageOffset,
        "--stage-width": stageWidth,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-70 blur-xs" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(246,215,151,0.16),transparent_26%),linear-gradient(90deg,rgba(4,6,16,0.76),rgba(4,6,16,0.36)_52%,rgba(55,39,17,0.68))]" />

      <div
        aria-label="返回入口"
        className="group/return absolute top-0 left-0 z-30 grid h-full w-[clamp(8rem,22vw,40rem)] cursor-pointer items-center justify-end overflow-hidden bg-linear-to-r from-[#f4c76b]/34 to-transparent pr-[clamp(1.5rem,6vw,12.5rem)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-linear-to-r before:from-[#f4c76b]/40 before:via-[#f4c76b]/12 before:to-transparent before:opacity-0 before:transition-opacity before:duration-700 before:ease-in-out before:content-[''] hover:before:opacity-100"
        onPointerEnter={() => setIsReturnHovered(true)}
        onPointerLeave={() => setIsReturnHovered(false)}
        role="button"
        tabIndex={0}
      >
        <div className="relative z-10 mt-12 h-fit w-fit select-none text-right">
          <span className="inline-block text-xs tracking-[0.32em] transition-all duration-[850ms] ease-in-out group-hover/return:tracking-[0.8em] sm:text-sm sm:tracking-[0.5em] sm:group-hover/return:tracking-[1.4em] xl:group-hover/return:tracking-[2em]">
            &lt;返回入口
          </span>
        </div>
      </div>

      <div
        className="relative h-full"
        style={{ marginLeft: "var(--stage-offset)" }}
      >
        <div
          className="pointer-events-none absolute top-[clamp(6.5rem,24vh,14rem)] z-30 grid"
          style={{
            left: "var(--stage-gutter)",
            width: "var(--stage-width)",
          }}
        >
          <div
            className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 text-xs font-medium tracking-[0.16em] text-[#f6d797] sm:text-sm sm:tracking-[0.18em]"
            style={getHoverShiftStyle(560)}
          >
            <BookOpen className="h-4 w-4" />
            <span>{phasePrefix} ·</span>
            <StageHeaderText
              activeStageIndex={activeStageIndex}
              items={phaseNames}
            />
            <span className="inline-flex items-center text-[#f8e8c4]/42">
              <span>階段&nbsp;</span>
              <StageHeaderText
                activeStageIndex={activeStageIndex}
                items={stageNumbers}
              />
            </span>
          </div>
        </div>

        {previewStages.map((stage, index) => (
          <section
            aria-hidden={index !== activeStageIndex}
            className="absolute top-[clamp(7.5rem,20vh,13rem)] grid items-center transition-all duration-900 ease-in-out"
            key={stage.checkpoint}
            style={{
              ...getDepthStageStyle(index - activeStageIndex),
              left: "var(--stage-gutter)",
              width: "var(--stage-width)",
            }}
          >
            <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
              <div className="grid gap-8">
                <div className="h-[clamp(4rem,10vh,6.5rem)]" />

                <div className="grid max-w-3xl gap-5">
                  <h1
                    className="text-5xl font-semibold leading-tight text-[#ffe9b7] drop-shadow-[0_4px_22px_rgba(0,0,0,0.74)] sm:text-6xl lg:text-7xl"
                    style={getHoverShiftStyle(660)}
                  >
                    {stage.title}
                  </h1>

                  <p
                    className="max-w-2xl text-lg leading-9 text-[#f8e8c4]/86"
                    style={getHoverShiftStyle(760)}
                  >
                    {stage.text}
                  </p>

                  <div
                    className="grid max-w-2xl gap-3 border-l border-[#f7d995]/30 pl-5"
                    style={getHoverShiftStyle(860)}
                  >
                    <p className="text-base leading-8 text-[#ffe9b7]">
                      {stage.prompt}
                    </p>
                  </div>

                  <form
                    className="grid max-w-2xl gap-3"
                    style={getHoverShiftStyle(960)}
                  >
                    <textarea
                      className="min-h-28 resize-none rounded-md border border-[#f7d995]/28 bg-[#080b14]/62 px-4 py-3 text-base leading-7 text-[#fff3d0] outline-none placeholder:text-[#f8e8c4]/34"
                      placeholder="讓她做什麼、想什麼，或說出一句沒說出口的話..."
                    />
                    <button
                      className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-[#f7d995]/42 bg-[#110d14]/76 px-5 text-sm font-semibold text-[#ffe9b7]"
                      type="button"
                    >
                      <Send className="mr-2 size-4" />
                      送出
                    </button>
                  </form>
                </div>
              </div>

              <aside
                className="grid gap-5 border-t border-[#f7d995]/22 pt-5 text-[#f8e8c4]/82 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
                style={getHoverShiftStyle(1080)}
              >
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
                    此刻場景
                  </p>
                  <p className="text-sm leading-7">{stage.detail}</p>
                </div>

                <div className="grid gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f6d797]">
                    象徵物
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stage.objects.map((object) => (
                      <span
                        className="rounded-md border border-[#f7d995]/22 bg-tale-ink/36 px-3 py-1.5 text-xs text-[#ffe9b7]"
                        key={object}
                      >
                        {object}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ))}
      </div>

      <div
        className="pointer-events-none absolute bottom-[clamp(1.25rem,3vh,1.75rem)] z-20"
        style={{
          left: "calc(var(--stage-offset) + var(--stage-gutter))",
          right: "var(--stage-gutter)",
        }}
      >
        <div
          className="mx-auto grid w-full max-w-6xl gap-3"
          style={getHoverShiftStyle(1180)}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-[#f6d797]/82">
            <span className="inline-flex items-center">
              <span>階段&nbsp;</span>
              <StageHeaderText
                activeStageIndex={activeStageIndex}
                items={stageNumbers}
              />
            </span>
            <span>
              {activeStageIndex + 1} / {previewStages.length}
            </span>
          </div>
          <div className="h-px w-full bg-[#f7d995]/20">
            <div
              className="h-px bg-[#f7d995] transition-[width] duration-700 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between">
            {previewStages.map((stage, index) => (
              <span
                className={`h-2 w-2 rounded-full border border-[#f7d995]/50 transition-all duration-500
                  ${index <= activeStageIndex ? "bg-[#f7d995]" : "bg-[#080b14]/70"}`}
                key={stage.checkpoint}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StageHeaderText({ activeStageIndex, className = "", items }) {
  return (
    <span className={`relative inline-grid min-w-0 ${className}`}>
      <span className="invisible col-start-1 row-start-1">
        {items.reduce((longestItem, item) =>
          item.length > longestItem.length ? item : longestItem,
        )}
      </span>
      {items.map((item, index) => (
        <span
          className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out
            ${index === activeStageIndex ? "translate-y-0 opacity-100 blur-0" : index < activeStageIndex ? "-translate-y-2 opacity-0 blur-[2px]" : "translate-y-2 opacity-0 blur-[2px]"}`}
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </span>
  );
}

function getHoverShiftStyle(duration) {
  return {
    transform: "translate3d(var(--stage-hover-shift), 0, 0)",
    transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    willChange: "transform",
  };
}

function getDepthStageStyle(offset) {
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
