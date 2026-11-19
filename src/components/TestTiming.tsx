"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import type { Section } from "@/lib/types";

export type TestModule = { section: Section; minutes: number; n: number };
export function TestTiming({modules}: {modules: TestModule[]}) {
  const [index,setIndex] = useState(0);
  const part = modules[index];
  const label = (m: TestModule) => m.section === "rw" ? "Reading & writing" : "Math";
  const total = modules.reduce((sum, m) => sum + m.minutes, 0);
  const start = modules.slice(0,index).reduce((sum, m) => sum + m.minutes, 0);
  const clock = (minutes: number) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2,"0")}`;
  return <>
    <h3>Rehearse the full test.</h3>
    <p>{modules.reduce((sum,m) => sum+m.n,0)} questions across four modules. Choose a module to see its timing.</p>
    <div className="timing-track" aria-hidden="true" style={{ "--from": start / total, "--length": part.minutes / total } as CSSProperties}>
      <div className="timer-display" key={index}><strong>{part.minutes}</strong><span>minutes</span></div>
      <div className="timer-ruler"><i /></div>
      <div className="time-ends"><span>{clock(0)}</span><span>Testing time · {clock(total)}</span></div>
    </div>
    <div className="module-score">{modules.map((m,i) => (
      <button key={i} aria-pressed={index === i} onClick={() => setIndex(i)}>
        <small>{label(m)}</small><strong>Module {i % 2 + 1}</strong><i aria-hidden="true" />
      </button>
    ))}</div>
    <p className="module-detail" aria-live="polite">{part.n} questions · {part.minutes} minutes. {index % 2 ? "Difficulty adapts to your first module." : "Your answers set the difficulty of the next module."}</p>
    <Link className="ink-link" href="/tests">Explore timed mock tests ↗</Link>
  </>;
}
