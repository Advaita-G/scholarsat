"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { IBook, IHome, IRefresh } from "./icons";

const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "dashboard",
    src: "/landing/dashboard.webp",
    alt: "A student's dashboard: a 4-day streak, a daily goal at 14 of 18 questions, a predicted score of 1270 and accuracy by skill",
    Icon: IHome,
  },
  {
    id: "bank",
    label: "Question bank",
    path: "practice",
    src: "/landing/bank.webp",
    alt: "The question bank, with an accuracy ring and a practice button on every math skill",
    Icon: IBook,
  },
  {
    id: "review",
    label: "Mistake review",
    path: "review",
    src: "/landing/review.webp",
    alt: "The review page listing 45 missed questions by skill and difficulty, each ready to retry",
    Icon: IRefresh,
  },
] as const;

/** Tabbed screenshots of the real app, framed like a browser window. */
export function LandingShowcase() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function moveTab(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % TABS.length
        : event.key === "ArrowLeft"
          ? (index + TABS.length - 1) % TABS.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? TABS.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="app-tour relative overflow-hidden rounded-3xl bg-accent-fill text-white">
      <div className="pattern-grid pointer-events-none absolute inset-0 text-white/[0.07]" />
      <div className="relative px-4 pt-5 sm:px-10 sm:pt-8">
        <div
          role="tablist"
          aria-label="App screens"
          className="flex gap-1.5 overflow-x-auto scroll-thin pb-1"
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              ref={(el) => {
                tabs.current[i] = el;
              }}
              tabIndex={active === i ? 0 : -1}
              onKeyDown={(e) => moveTab(e, i)}
              id={`showcase-tab-${t.id}`}
              aria-selected={i === active}
              aria-controls="showcase-panel"
              onClick={() => setActive(i)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors ${
                i === active
                  ? "bg-bg text-ink"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <t.Icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div
          id="showcase-panel"
          role="tabpanel"
          aria-labelledby={`showcase-tab-${tab.id}`}
          className="mt-5 overflow-hidden rounded-t-xl border border-b-0 border-black/20 bg-bg shadow-[0_-8px_60px_rgb(0_0_0/0.28)] sm:mt-7"
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </span>
            <span className="mx-auto w-full max-w-xs truncate rounded-md bg-bg px-3 py-1 text-center font-mono text-[12px] text-muted">
              scholarsat.com/{tab.path}
            </span>
            <span className="w-10" aria-hidden="true" />
          </div>
          <div className="relative aspect-[2040/1040] overflow-hidden">
            {TABS.map((t, i) => (
              <Image
                key={t.id}
                src={t.src}
                alt={i === active ? t.alt : ""}
                aria-hidden={i !== active}
                width={2200}
                height={1375}
                sizes="(min-width: 850px) 60vw, 90vw"
                className={`absolute inset-x-0 top-0 h-auto w-full tour-image ${i === active ? "tour-active" : "tour-hidden"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
