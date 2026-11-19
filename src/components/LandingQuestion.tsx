"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { LandingWork, type WorkKind } from "./LandingWork";

export type LandingItem = {
  id: string;
  label: string;
  title: string;
  topic: string;
  difficulty?: string;
  passageHtml?: string;
  stemHtml: string;
  sentence?: { before: string; clue: string; between: string; after: string };
  choices: { html: string; label: string }[];
  answer: string;
  explanationHtml: string;
  work?: WorkKind;
};

const LETTERS = "ABCD";
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export function LandingQuestion({ items }: { items: LandingItem[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pointerFeedback, setPointerFeedback] = useState(false);
  const questionTitle = useRef<HTMLHeadingElement>(null);
  const focusQuestion = useRef(false);
  const answerTray = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const origin = useRef<DOMRect | null>(null);
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

  useLayoutEffect(() => {
    const from = origin.current;
    origin.current = null;
    const target = word.current;
    if (!from || !target || !target.animate) return;

    const to = target.getBoundingClientRect();
    if (!to.height || !from.height) return;
    const x = from.left + from.width / 2 - to.left - to.width / 2;
    const y = from.top + from.height / 2 - to.top - to.height / 2;
    const scale = from.height / to.height;
    const flight = target.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity: 0.8 },
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
      ],
      { duration: 260, easing: EASE_OUT },
    );
    return () => flight.cancel();
  }, [index, picked]);

  function selectQuestion(next: number) {
    setPointerFeedback(false);
    setIndex(next);
  }

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
    selectQuestion(next);
    document.getElementById("sample-tab-" + items[next].id)?.focus();
  }

  function choose(event: MouseEvent<HTMLButtonElement>, letter: string) {
    if (locked || letter === picked) return;
    const animate = event.detail > 0 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !document.documentElement.classList.contains("reduce-motion");

    if (animate && q.sentence) {
      const displayLetter = vocabulary ? letter : q.answer;
      origin.current = answerTray.current
        ?.querySelector(`[data-choice="${displayLetter}"] .choice-word`)
        ?.getBoundingClientRect() ?? null;
    }
    setPointerFeedback(animate);
    setAnswers((previous) => ({ ...previous, [q.id]: letter }));
  }

  const displayLetter = locked ? q.answer : picked;
  const displayWord = displayLetter ? q.choices[LETTERS.indexOf(displayLetter)]?.label : undefined;

  return (
    <div id="sample" className="exam-scene">
      <div className="exam-spine">
        <span className="folio-meta exam-index">
          Try a question <span aria-hidden="true">·</span> {index + 1} of {items.length}
        </span>
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
              onClick={() => selectQuestion(i)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id="sample-panel"
        role="tabpanel"
        className="exam-spread"
        aria-labelledby={"sample-tab-" + q.id}
        data-revealed={locked}
        data-motion={pointerFeedback ? "active" : "still"}
      >
        <div className="exam-problem">
          <p className="folio-meta exam-topic">
            {q.topic}{q.difficulty && <span> / {q.difficulty}</span>}
          </p>
          <h2 className="exam-question-title" ref={questionTitle} tabIndex={-1}>{q.title}</h2>

          {q.sentence && (
            <p className="exam-sentence" aria-hidden="true">
              {q.sentence.before}
              <span className="sentence-clue">{q.sentence.clue}</span>
              <span className={q.work === "grammar" ? "sentence-aside" : undefined}>{q.sentence.between}</span>
              <span className={q.work === "grammar" ? "sentence-predicate" : undefined}>
                <span className="sentence-slot" data-filled={!!displayWord}>
                  <span ref={word}>{displayWord || "___"}</span>
                </span>
                {q.sentence.after}
              </span>
            </p>
          )}

          {q.passageHtml && (
            <p className={q.sentence ? "sr-only" : "exam-passage"} dangerouslySetInnerHTML={{ __html: q.passageHtml }} />
          )}
          <p
            className={q.sentence ? "sr-only" : "exam-prompt qtext"}
            data-large={!q.sentence}
            dangerouslySetInnerHTML={{ __html: q.stemHtml }}
          />
        </div>

        <div className="exam-answers" ref={answerTray} role="group" aria-label="Answer choices">
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
                data-choice={letter}
                onClick={(event) => choose(event, letter)}
              >
                <span className="exam-letter" aria-hidden="true">{letter}</span>
                <span className="sr-only">{letter}. </span>
                <span className="choice-word qtext" dangerouslySetInnerHTML={{ __html: html }} />
                {result && <span className="sr-only">, {result}</span>}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" aria-atomic="true" className="exam-feedback">
          {picked && (
            <div className="exam-mark">
              <p><strong>{correct ? "Correct." : vocabulary ? "Try again." : "The answer is " + q.answer + "."}</strong></p>
              {locked ? (
                <p className="qtext" dangerouslySetInnerHTML={{ __html: q.explanationHtml }} />
              ) : (
                <p>Look for the clue about when the map will change.</p>
              )}
            </div>
          )}
        </div>

        {locked && (q.work === "systems" || q.work === "percentages") && (
          <LandingWork key={q.id} work={q.work} />
        )}

        {(locked || vocabulary) && (
          <div className="exam-progress">
            {locked && index < items.length - 1 && (
              <button type="button" className="folio-link" onClick={() => {
                focusQuestion.current = true;
                selectQuestion(index + 1);
              }}>
                Next question <span aria-hidden="true">→</span>
              </button>
            )}
            {vocabulary && bankComplete && <span>{score} / {bankItems.length} bank questions correct</span>}
            {vocabulary && <Link className="folio-link" href="/vocab">More vocabulary <span aria-hidden="true">↗</span></Link>}
          </div>
        )}
      </div>
    </div>
  );
}
