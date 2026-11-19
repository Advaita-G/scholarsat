"use client";

import { useState } from "react";
import Link from "next/link";
import type { Section } from "@/lib/types";

export type TestModule = { section: Section; minutes: number; n: number };
export function TestTiming({modules}: {modules: TestModule[]}) {
  const [index,setIndex] = useState(0);
  const part = modules[index];
  const label = (m: TestModule) => m.section === "rw" ? "Reading & writing" : "Math";
  return <>
    <h3>Rehearse the full test.</h3>
    <p>{modules.reduce((sum,m) => sum+m.n,0)} questions across four modules. Choose a module to see its timing.</p>
    <div className="module-score">{modules.map((m,i) => (
      <button key={i} aria-pressed={index === i} onClick={() => setIndex(i)}>
        <small>{label(m)}</small><strong>Module {i % 2 + 1}</strong><i aria-hidden="true" />
      </button>
    ))}</div>
    <p className="module-detail" aria-live="polite">{part.n} questions · {part.minutes} minutes. {index % 2 ? "Difficulty adapts to your first module." : "Your answers set the difficulty of the next module."}</p>
    <Link className="ink-link" href="/tests">Explore timed mock tests ↗</Link>
  </>;
}
