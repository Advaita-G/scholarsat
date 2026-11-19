"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { PracticeSetPicker, practiceSet } from "./PracticeSetPicker";
import { TestTiming, type TestModule } from "./TestTiming";

const stops = [
  { id: "bank", label: "Practice sets" },
  { id: "tests", label: "Mock tests" },
  { id: "tools", label: "Study tools" },
];

export function StudyDesk({ counts, total, modules, signedIn }: { signedIn: boolean; counts: Record<string, number>; total: number; modules: TestModule[] }) {
  const [chosen, setChosen] = useState<ReturnType<typeof practiceSet> | null>(null);
  const destination = chosen?.n ? chosen : null;
  const desk = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState("bank");

  useEffect(() => {
    const panels = Array.from(desk.current!.querySelectorAll<HTMLElement>(".desk-panel"));
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      const atReadingLine = panels.filter(panel => visible.has(panel)).at(-1);
      if (atReadingLine) setCurrent(atReadingLine.id);
    }, { rootMargin: "-30% 0px -55% 0px" });
    panels.forEach(panel => observer.observe(panel));
    return () => observer.disconnect();
  }, []);

  return (<>
    <section ref={desk} className="study-desk measure" aria-labelledby="desk-title">
      <div className="desk-contents">
        <h2 id="desk-title">Inside ScholarSAT</h2>
        <p className="desk-intro">
          Practice Math and Reading &amp; Writing with {total.toLocaleString("en-US")} free questions.
          Take a timed mock test, then use your results to choose what to work on next.
        </p>
        <nav aria-label="Study options" style={{ "--stop": stops.findIndex(stop => stop.id === current) } as CSSProperties}>
          {stops.map(({ id, label }) => (
            <Link key={id} href={"/#" + id} aria-current={current === id ? "location" : undefined}>
              {label}<span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="study-stops">
        <section className="desk-panel" id="bank" aria-labelledby="sets-title">
          <h3 id="sets-title">Build a practice set.</h3>
          <p>Pick a skill for a short drill, with an explanation after every answer.</p>
          <PracticeSetPicker counts={counts} set={chosen ?? practiceSet(counts,"math")} onChoose={setChosen} />
          <Link className="ink-link" href="/practice">Browse all {total.toLocaleString("en-US")} questions ↗</Link>
        </section>
        <section className="desk-panel" id="tests" aria-label="Mock tests"><TestTiming modules={modules} /></section>
        <section className="desk-panel" id="tools" aria-labelledby="tools-title">
          <h3 id="tools-title">Study from your answers.</h3>
          <div className="tool-paths">
            <Link href="/review"><strong>Mistake review</strong><span>Retry questions you missed.</span><b aria-hidden="true">↗</b></Link>
            <Link href="/diagnostics"><strong>Skill diagnostics</strong><span>See your accuracy by skill.</span><b aria-hidden="true">↗</b></Link>
            <Link href="/vocab"><strong>Vocabulary</strong><span>Practice words in context.</span><b aria-hidden="true">↗</b></Link>
          </div>
        </section>
      </div>
    </section>
    <section className="journey-entry measure" aria-label="Enter ScholarSAT">
      <div>
        <h2>Enter <span>ScholarSAT</span></h2>
        <p key={destination?.href}>{destination ? `Your ${destination.n}-question set on ${destination.selected} is ready. Check each answer and work through its explanation.` : signedIn ? "Your saved progress, missed questions, and next practice session are in your dashboard." : "Choose a skill and start practicing for free. Create an account whenever you want to save your progress."}</p>
      </div>
      <Link className="entry-link" href={destination ? destination.href : signedIn ? "/dashboard" : "/practice"}>
        {destination ? "Start my set" : signedIn ? "Open my dashboard" : "Open the question bank"} <span className="entry-port" aria-hidden="true">↗</span>
      </Link>
    </section>
  </>);
}
