"use client";

import { useState } from "react";
import Link from "next/link";
import { PracticeSetPicker, practiceSet } from "./PracticeSetPicker";
import { StudyFolio } from "./StudyFolio";
import { TestTiming, type TestModule } from "./TestTiming";

const stops = [
  { id: "bank", label: "Practice sets" },
  { id: "tests", label: "Mock tests" },
  { id: "tools", label: "Study tools" },
  { id: "enter", label: "Enter ScholarSAT" },
];

export type StudyOptions = {signedIn: boolean; counts: Record<string, number>; total: number; modules: TestModule[]};
export function StudyDesk({ counts, total, modules, signedIn, passage, response, solved }: StudyOptions & {
  passage: string; response?: string; solved: boolean;
}) {
  const [chosen, setChosen] = useState<ReturnType<typeof practiceSet> | null>(null);
  const set = chosen ?? practiceSet(counts, "rw", "Transitions");
  const [moduleIndex,setModuleIndex] = useState(0);
  const destination = set.n && (chosen || solved) ? set : null;
  const [chapter,setChapter] = useState(0);

  return (
    <section id="book" className="study-desk measure" aria-labelledby="desk-title">
      <div className="desk-contents">
        <h2 id="desk-title" className="sr-only">Inside ScholarSAT</h2>
        <StudyFolio modules={modules} index={moduleIndex} skill={set.selected} count={set.n} passage={passage} response={response} solved={solved} onChapter={setChapter} />
        <nav aria-label="Study options">
          {stops.map(({ id, label },i) => (
            <Link key={id} href={"/#" + id} aria-current={chapter === i ? "location" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="study-stops">
        <section className="desk-panel" id="bank" aria-labelledby="sets-title">
          <h3 id="sets-title">Your practice set</h3>
          <p>Choose a skill from {total.toLocaleString("en-US")} questions. Get an explanation after each answer.</p>
          <PracticeSetPicker counts={counts} set={set} onChoose={setChosen} />
          <Link className="ink-link" href="/practice">Browse all {total.toLocaleString("en-US")} questions ↗</Link>
        </section>
        <section className="desk-panel" id="tests" aria-label="Mock tests"><TestTiming modules={modules} index={moduleIndex} onChange={setModuleIndex} /></section>
        <section className="desk-panel" id="tools" aria-labelledby="tools-title">
          <h3 id="tools-title">Review your work</h3>
          {response && <p className="study-attempt">You chose <strong>{response}</strong> {solved ? "to introduce the Babylonian example." : "for the lunar passage."} <Link href="/#passage">{solved ? "Read the explanation" : "Try another answer"} ↗</Link></p>}
          <div className="tool-paths">
            <Link href="/review"><strong>Mistake review</strong><span>Retry questions you missed.</span><b aria-hidden="true">↗</b></Link>
            <Link href="/diagnostics"><strong>Skill diagnostics</strong><span>See your accuracy by skill.</span><b aria-hidden="true">↗</b></Link>
            <Link href="/vocab"><strong>Vocabulary</strong><span>Practice words in context.</span><b aria-hidden="true">↗</b></Link>
          </div>
        </section>
        <section id="enter" className="desk-panel journey-entry" aria-label="Enter ScholarSAT">
          <div>
            <h2>Enter <span>ScholarSAT</span></h2>
            <p key={destination?.href}>{destination ? `Your ${destination.n}-question set on ${destination.selected} is ready. Check each answer and work through its explanation.` : signedIn ? "Your saved progress, missed questions, and next practice session are in your dashboard." : "Choose a skill and start practicing for free. Create an account whenever you want to save your progress."}</p>
          </div>
          <Link className="entry-link" href={destination ? destination.href : signedIn ? "/dashboard" : "/practice"}>
            {destination ? "Start my set" : signedIn ? "Open my dashboard" : "Open the question bank"} <span className="entry-port" aria-hidden="true">↗</span>
          </Link>
          {destination && <Link className="ink-link" href="/practice">Open the question bank</Link>}
        </section>
      </div>
    </section>
  );
}
