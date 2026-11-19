"use client";

import Link from "next/link";
import type { Section } from "@/lib/types";

export type TestModule = { section: Section; minutes: number; n: number };
export const moduleName = (part: TestModule, i: number) =>
  `${part.section === "rw" ? "Reading & writing" : "Math"} · Module ${i % 2 + 1}`;

export function TestTiming({modules, index, onChange}: {
  modules: TestModule[]; index: number; onChange: (index: number) => void;
}) {
  const part = modules[index];
  const minutes = modules.reduce((sum,m) => sum + m.minutes, 0);
  return <>
    <h3>Mock test</h3>
    <p>Work through {modules.reduce((sum,m) => sum + m.n, 0)} questions in {Math.floor(minutes/60)} hours and {minutes%60} minutes of testing.</p>
    <label className="module-picker">Explore a module
      <select value={index} onChange={e => onChange(Number(e.target.value))}>
        {modules.map((m,i) => <option value={i} key={i}>{moduleName(m,i)}</option>)}
      </select>
    </label>
    <p className="module-detail" aria-live="polite">{part.n} questions · {part.minutes} minutes. {index % 2 ? "Difficulty adapts to your first module." : "Your answers set the difficulty of the next module."}</p>
    <Link className="ink-link" href="/tests">Open mock tests <span aria-hidden="true">↗</span></Link>
  </>;
}
