"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { LandingWork, type WorkKind } from "./LandingWork";

export type LandingItem = {
  id: string;
  label: string;
  title: string;
  topic: string;
  difficulty?: string;
  passageHtml?: string;
  stemHtml: string;
  choices: { html: string; label: string }[];
  answer: string;
  explanationHtml: string;
  work?: WorkKind;
};

const LETTERS = "ABCD";

export function LandingQuestion({ items }: { items: LandingItem[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const focusQuestion = useRef(false);
  const q = items[index];
  const picked = answers[q.id];
  const correct = picked === q.answer;
  const vocabulary = q.work === "vocabulary";
  const locked = !!picked && (!vocabulary || correct);
  const bankItems = items.filter((item) => item.work !== "vocabulary");
  const bankComplete = bankItems.length > 0 && bankItems.every((item) => answers[item.id]);
  const score = bankItems.filter((item) => answers[item.id] === item.answer).length;

  useEffect(() => {
    if (focusQuestion.current) {
      focusQuestion.current = false;
      questionTitle.current?.focus();
    }
  }, [index]);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>) {
    let next: number;
    switch (event.key) {
      case "ArrowLeft": next = (index + items.length - 1) % items.length; break;
      case "ArrowRight": next = (index + 1) % items.length; break;
      case "Home": next = 0; break;
      case "End": next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    setIndex(next);
    document.getElementById("sample-tab-" + items[next].id)?.focus();
  }

  return (
    <div id="sample" className="exam-book">
      <div className="exam-spine">
        <span className="folio-meta">Try a question</span>
        <div className="exam-tabs" role="tablist" aria-label="Sample questions">
          {items.map((item, i) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              id={"sample-tab-" + item.id}
              aria-controls="sample-panel"
              aria-selected={i === index}
              tabIndex={i === index ? 0 : -1}
              onKeyDown={moveTab}
              onClick={() => setIndex(i)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id="sample-panel"
        className="exam-spread"
        role="tabpanel"
        aria-labelledby={"sample-tab-" + q.id}
        data-revealed={locked}
      >
        <div className="exam-problem">
          <p className="folio-meta exam-topic">
            {q.topic}
            {q.difficulty && <span> / {q.difficulty}</span>}
          </p>
          <h2 className="exam-question-title" ref={questionTitle} tabIndex={-1}>
            {q.title}
          </h2>
          {q.passageHtml && (
            <p className="exam-passage qtext" dangerouslySetInnerHTML={{ __html: q.passageHtml }} />
          )}
          <p className="exam-prompt qtext" dangerouslySetInnerHTML={{ __html: q.stemHtml }} />

          <div className="exam-answers" role="group" aria-label="Answer choices">
            {q.choices.map(({ html }, i) => {
              const letter = LETTERS[i];
              const result = locked && letter === q.answer ? "Correct" : letter === picked ? "Incorrect" : undefined;
              return (
                <button
                  key={letter}
                  type="button"
                  aria-disabled={locked}
                  aria-pressed={picked === letter}
                  tabIndex={locked && letter !== picked ? -1 : undefined}
                  data-result={result}
                  onClick={() => {
                    if (!locked) setAnswers((previous) => ({ ...previous, [q.id]: letter }));
                  }}
                >
                  <span className="exam-letter" aria-hidden="true">{letter}</span>
                  <span className="sr-only">{letter}. </span>
                  <span className="qtext" dangerouslySetInnerHTML={{ __html: html }} />
                  {result && <span className="sr-only">, {result}</span>}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" aria-atomic="true" className="exam-feedback">
            {picked && (
              <div key={q.id + picked} className="exam-mark">
                <p><strong>{correct ? "Correct." : vocabulary ? "Try again." : "The answer is " + q.answer + "."}</strong></p>
                {locked ? (
                  <p className="qtext" dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
                ) : (
                  <p>Look for the clue about when the map will change.</p>
                )}
              </div>
            )}
          </div>

          <div className="exam-progress">
            <span className="folio-meta">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            {locked && index < items.length - 1 && (
              <button type="button" className="folio-link" onClick={() => {
                focusQuestion.current = true;
                setIndex(index + 1);
              }}>
                Next question <span aria-hidden="true">→</span>
              </button>
            )}
            {vocabulary && bankComplete && <span>{score} / {bankItems.length} bank questions correct</span>}
            {vocabulary && <Link className="folio-link" href="/vocab">More vocabulary <span aria-hidden="true">↗</span></Link>}
          </div>
        </div>

        <LandingWork key={q.id} work={q.work} revealed={locked} attempt={vocabulary && picked ? q.choices[LETTERS.indexOf(picked)].label : undefined} />
      </div>
    </div>
  );
}
