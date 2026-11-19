"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PracticeSetPicker } from "./PracticeSetPicker";
import { TestTiming, type TestModule } from "./TestTiming";

const modes = [
  {id:"bank",label:"Practice sets"},
  {id:"tests",label:"Mock tests"},
  {id:"tools",label:"Study tools"},
] as const;
export function StudyDesk({counts,total,modules}: {counts:Record<string,number>;total:number;modules:TestModule[]}) {
  const [mode,setMode] = useState(0);
  useEffect(() => {
    function readHash() {
      const index = modes.findIndex(m => "#"+m.id === location.hash);
      if (index !== -1) setMode(index);
    }
    readHash();
    addEventListener("hashchange",readHash);
    return () => removeEventListener("hashchange",readHash);
  },[]);
  function select(i:number) {
    setMode(i);
    history.replaceState(history.state,"","#"+modes[i].id);
  }
  return <section className="study-desk measure" aria-label="Continue studying">
    <div className="desk-contents">
      <p className="overline">Continue studying</p>
      <div role="tablist" aria-label="Study options">{modes.map((m,i) => (
        <button role="tab" id={m.id} key={m.id} aria-selected={mode === i} aria-controls="desk-panel" tabIndex={mode === i ? 0 : -1}
          onClick={() => select(i)} onKeyDown={e => {
            let next;
            switch (e.key) {
              case "ArrowRight": case "ArrowDown": next = (i+1)%3; break;
              case "ArrowLeft": case "ArrowUp": next = (i+2)%3; break;
              case "Home": next=0; break;
              case "End": next=2; break;
              default:return;
            }
            e.preventDefault();select(next);document.getElementById(modes[next].id)?.focus();
          }}>{m.label}<span aria-hidden="true">↗</span></button>
      ))}</div>
    </div>
    <div className="desk-panel" role="tabpanel" id="desk-panel" aria-labelledby={modes[mode].id}>
      {mode === 0 ? <>
        <h3>Build a practice set.</h3><p>Pick a skill for a short drill, with an explanation after every answer.</p>
        <PracticeSetPicker counts={counts} />
        <Link className="ink-link" href="/practice">Browse all {total.toLocaleString("en-US")} questions ↗</Link>
      </> : mode === 1 ? <TestTiming modules={modules} /> : <>
        <h3>Study from your answers.</h3>
        <div className="tool-paths">
          <Link href="/review"><strong>Mistake review</strong><span>Retry questions you missed.</span><b aria-hidden="true">↗</b></Link>
          <Link href="/diagnostics"><strong>Skill diagnostics</strong><span>See your accuracy by skill.</span><b aria-hidden="true">↗</b></Link>
          <Link href="/vocab"><strong>Vocabulary</strong><span>Practice words in context.</span><b aria-hidden="true">↗</b></Link>
        </div>
      </>}
    </div>
  </section>;
}
