"use client";
import Link from "next/link";
import { useState } from "react";
import { LandingQuestion, type LandingItem } from "./LandingQuestion";
import { Owl } from "./Owl";
import { lessons } from "@/data/context-lessons";

export function LandingStudio({ items }: { items: LandingItem[] }) {
  const [reading, setReading] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [bankResult, setBankResult] = useState<boolean | null>(null);
  const lesson = lessons[0];
  const result = reading ? (picked === null ? null : picked === lesson.word) : bankResult;
  return (
    <div id="sample" className="practice-desk">
      <div className="desk-spine">
        <div className="desk-mascot">
          <Owl
            size={106}
            mood={result === true ? "celebrate" : result === false ? "sad" : "idle"}
          />
        </div>
        <h2>Try a question.</h2>
        <p>Pick an answer for a worked explanation.</p>
        <div className="desk-modes" role="group" aria-label="Sample mode">
          <button aria-pressed={!reading} onClick={() => setReading(false)}>
            Question bank <span>→</span>
          </button>
          <button aria-pressed={reading} onClick={() => setReading(true)}>
            Vocabulary <span>→</span>
          </button>
        </div>
      </div>
      <div className="desk-pages">
        <div className="desk-pencil" aria-hidden="true">
          <i />
          <b />
        </div>
        <div hidden={reading}>
          <LandingQuestion items={items} onResult={setBankResult} />
        </div>
        {reading && (
          <section className="vocab-sheet" aria-label="Sample vocabulary">
            <div className="sheet-meta">Vocabulary studio</div>
            <h3>Which word fits?</h3>
            <p className="vocab-passage">
              {lesson.passage.split("____")[0]}
              <strong key={picked}>{picked ?? "____"}</strong>.
            </p>
            <div className="vocab-choices">
              {lesson.choices.map((w) => (
                <button
                  key={w}
                  aria-pressed={picked === w}
                  onClick={() => setPicked(w)}
                >
                  {w}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {picked && (
                <p className="sheet-feedback">
                  {picked === lesson.word
                    ? "Correct. " + lesson.why
                    : "The map will be redrawn. Which word means that the boundary is temporary?"}
                </p>
              )}
            </div>
            <Link href="/vocab">Practice more vocabulary →</Link>
          </section>
        )}
      </div>
    </div>
  );
}
