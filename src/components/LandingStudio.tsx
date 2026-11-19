"use client";
import Link from "next/link";
import { useState } from "react";
import { LandingQuestion, type LandingItem } from "./LandingQuestion";
import { lessons } from "@/data/context-lessons";
export function LandingStudio({ items }: { items: LandingItem[] }) {
  const [reading, setReading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const lesson = lessons[0];
  return (
    <div className="trial">
      <div className="trial-head">
        <h2>Try a problem.</h2>
        <div className="trial-switch">
          <button aria-pressed={!reading} onClick={() => setReading(false)}>
            Question bank
          </button>
          <button aria-pressed={reading} onClick={() => setReading(true)}>
            Vocabulary
          </button>
        </div>
      </div>
      <div hidden={reading}>
        <LandingQuestion items={items} />
      </div>
      {reading && (
        <article className="reading-sample">
          <p className="reading-instruction">
            Choose the word that completes the passage.
          </p>
          <p className="passage">
            {lesson.passage.split("____")[0]}
            <strong key={picked}>{picked ?? "____"}</strong>.
          </p>
          <div className="word-choices">
            {lesson.choices.map((w) => (
              <button
                key={w}
                aria-pressed={w === picked}
                onClick={() => setPicked(w)}
              >
                {w}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            {picked && (
              <p className="reading-response">
                {picked === lesson.word
                  ? "Correct. " + lesson.why
                  : "Look at “will be redrawn.” Which word suggests the boundary is temporary?"}
              </p>
            )}
          </div>
          <Link href="/vocab">Open vocabulary studio ↗</Link>
        </article>
      )}
    </div>
  );
}
