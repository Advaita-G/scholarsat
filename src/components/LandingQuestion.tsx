"use client";

import Link from "next/link";
import { useState } from "react";

export type LandingItem = {
  id: string;
  /** e.g. "Math, Algebra" */
  topic: string;
  difficulty: string;
  passageHtml?: string;
  stemHtml: string;
  choicesHtml: string[];
  /** "A" | "B" | "C" | "D" */
  answer: string;
  explanationHtml: string;
};

const LETTERS = "ABCD";

export function LandingQuestion({ items }: { items: LandingItem[] }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const q = items[idx];
  const answered = picked !== null;
  const jacket = q.id === "m30ee0293";

  function pick(letter: string) {
    if (answered) return;
    setPicked(letter);
    if (letter === q.answer) setRight((n) => n + 1);
  }

  return (
    <section key={q.id} className="studio-spread" aria-label="Sample question">
      <div className="challenge-copy">
        <p className="studio-meta">
          {q.topic} · {q.difficulty}
        </p>
        {jacket ? (
          <>
            <h1 key={String(answered)} className="challenge-type">
              <span>
                <b>{answered ? "Up $25." : "Up 25%."}</b>
              </span>
              <span>
                <b>{answered ? "Down $12.50." : "Down 10%."}</b>
              </span>
            </h1>
            <p className="challenge-prompt">
              A $100 jacket gets marked up, then discounted. What percentage of
              its original price do you pay?
            </p>
          </>
        ) : (
          <>
            <h1 className="challenge-heading">
              {q.topic.split(" · ")[1] || q.topic}
            </h1>
            {q.passageHtml && (
              <div
                className="qtext challenge-passage"
                dangerouslySetInnerHTML={{ __html: q.passageHtml }}
              />
            )}
            <div
              className="qtext challenge-prompt"
              dangerouslySetInnerHTML={{ __html: q.stemHtml }}
            />
          </>
        )}
      </div>
      <div className="answer-sheet">
        <div className="sheet-title">
          <h2>Answer sheet</h2>
          <span>
            {idx + 1} / {items.length}
          </span>
        </div>
        {jacket && (
          <div className="jacket-total">
            <span>Final price</span>
            <strong
              key={String(answered)}
              aria-label={answered ? "112 dollars and 50 cents" : "Unknown"}
            >
              {answered ? "$112.50" : "$?.??"}
            </strong>
          </div>
        )}
        <div className="answer-lines" role="group" aria-label="Answer choices">
          {q.choicesHtml.map((html, i) => {
            const letter = LETTERS[i];
            const status =
              answered && letter === q.answer
                ? "Correct"
                : letter === picked
                  ? "Incorrect"
                  : undefined;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => pick(letter)}
                data-result={status}
                aria-disabled={answered}
                aria-pressed={letter === picked}
              >
                <small>{letter}</small>
                <span
                  className="qtext"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                {status && <em>{status}</em>}
              </button>
            );
          })}
        </div>
        <div aria-live="polite">
          {answered && (
            <div className="answer-note">
              <p>
                <b>
                  {picked === q.answer
                    ? "Correct."
                    : "The answer is " + q.answer + "."}
                </b>
              </p>
              {jacket ? (
                <p>
                  The markup takes the jacket to $125. The discount takes $12.50
                  off that new price, leaving 112.5% of the original.
                </p>
              ) : (
                <div
                  className="qtext"
                  dangerouslySetInnerHTML={{ __html: q.explanationHtml }}
                />
              )}
              {idx + 1 < items.length ? (
                <button
                  type="button"
                  className="sheet-link"
                  onClick={() => {
                    setIdx(idx + 1);
                    setPicked(null);
                  }}
                >
                  Next question →
                </button>
              ) : (
                <p>
                  {right} of {items.length} correct.{" "}
                  <Link className="sheet-link" href="/practice">
                    Keep practicing →
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
