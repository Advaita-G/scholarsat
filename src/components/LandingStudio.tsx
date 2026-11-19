"use client";

import Link from "next/link";
import { useState } from "react";
import { LandingQuestion, type LandingItem } from "./LandingQuestion";
import { lessons } from "@/data/context-lessons";

export function LandingStudio({
  items,
  total,
}: {
  items: LandingItem[];
  total: number;
}) {
  const [reading, setReading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const lesson = lessons[0];
  return (
    <section
      id="sample"
      className="prep-width sample-studio"
      aria-label="Try free SAT practice"
    >
      <div className="studio-toolbar">
        <p>Free SAT practice</p>
        <div role="group" aria-label="Sample mode">
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
        <section className="studio-spread" aria-label="Sample vocabulary">
          <div className="challenge-copy">
            <p className="studio-meta">
              Reading and writing · Words in context
            </p>
            <h1 className="challenge-type">
              <span>
                <b>Which word</b>
              </span>
              <span>
                <b>fits?</b>
              </span>
            </h1>
            <p className="challenge-prompt">
              {lesson.passage.split("____")[0]}
              <strong key={picked}>{picked ?? "____"}</strong>.
            </p>
          </div>
          <div className="answer-sheet">
            <h2>Complete the sentence</h2>
            <div
              className="answer-lines"
              role="group"
              aria-label="Vocabulary choices"
            >
              {lesson.choices.map((word, i) => (
                <button
                  key={word}
                  aria-pressed={picked === word}
                  onClick={() => setPicked(word)}
                >
                  <small>{"ABC"[i]}</small>
                  <span>{word}</span>
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {picked && (
                <p key={picked} className="answer-note">
                  {picked === lesson.word
                    ? "Correct. " + lesson.why
                    : "The map will be redrawn. Which word means temporary?"}
                </p>
              )}
            </div>
            <Link className="sheet-link" href="/vocab">
              Practice more vocabulary →
            </Link>
          </div>
        </section>
      )}
      <div className="studio-footer">
        <Link href="/practice">
          Explore {total.toLocaleString("en-US")} free questions{" "}
          <span aria-hidden="true">→</span>
        </Link>
        <a href="#tests">
          Try a practice test <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
