"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { moduleName, type TestModule } from "./TestTiming";
import { Owl } from "./Owl";

function Leaf({front, back}: {front: ReactNode; back: ReactNode}) {
  return <div className="folio-leaf"><div className="leaf-face">{front}</div><div className="leaf-face leaf-reverse">{back}</div></div>;
}

function MoonPrint({close = false}: {close?: boolean}) {
  return <div className={close ? "moon-print crater-print" : "moon-print"}>
    <Image src="/landing/lunar/0301.webp" width={500} height={500} alt="" unoptimized />
  </div>;
}

const clamp = (n: number) => Math.max(0,Math.min(1,n));
export function StudyFolio({modules, index, skill, count, passage, onChapter}: {
  modules: TestModule[]; index: number; skill: string; count: number; passage: string; onChapter: (index: number) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = stage.current!;
    const story = frame.closest(".study-desk")!;
    const panels = Array.from(story.querySelectorAll<HTMLElement>(".desk-panel"));
    const leaves = Array.from(frame.querySelectorAll<HTMLElement>(".folio-leaf"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let stops: number[] = [];
    let raf = 0;
    let previous = -1;
    function paint() {
      raf = 0;
      let position = 0;
      for (let i=0; i<leaves.length; i++) position += clamp((scrollY-stops[i]) / Math.max(1,stops[i+1]-stops[i]));
      if (motion.matches || document.documentElement.classList.contains("reduce-motion")) position = Math.round(position);
      if (position === previous) return;
      previous = position;
      const turns = leaves.map((leaf,i) => {
        const t = clamp((position-i-.12)/.76);
        const eased = t*t*(3-2*t);
        leaf.style.setProperty("--angle", String(-179.7*eased) + "deg");
        leaf.style.setProperty("--shade", String(.28*Math.sin(eased*Math.PI)));
        leaf.style.zIndex = String(eased > .5 ? i+1 : 12-i);
        return eased;
      });
      frame.style.setProperty("--open", String(turns[0]));
      frame.style.setProperty("--close", String(turns[3]));
      const spread = Math.round(position);
      if (frame.dataset.spread !== String(spread)) {
        frame.dataset.spread = String(spread);
        onChapter(Math.max(0,spread-1));
      }
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(paint); }
    function measure() {
      const mobile = matchMedia("(max-width:760px)").matches;
      const line = innerHeight*(mobile ? .72 : .53);
      stops = panels.map(el => el.getBoundingClientRect().top + scrollY + el.getBoundingClientRect().height/2 - line);
      stops.unshift(stops[0]-Math.min(540,innerHeight*.8));
      const limit = document.documentElement.scrollHeight-innerHeight;
      stops[stops.length-1] = Math.min(limit,stops[stops.length-1]);
      schedule();
    }
    const resize = new ResizeObserver(measure);
    [story,document.body,...panels].forEach(el => resize.observe(el));
    const prefs = new MutationObserver(schedule);
    prefs.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    measure();
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",measure);
    motion.addEventListener("change",schedule);
    return () => { resize.disconnect(); prefs.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("scroll",schedule); window.removeEventListener("resize",measure); motion.removeEventListener("change",schedule); };
  }, [onChapter]);
  const part = modules[index];
  const [claim, example] = passage.split(/\s*_{4,}\s*/);
  return <div ref={stage} className="folio-stage" aria-hidden="true">
    <div className="folio-binding">
      <Leaf front={<div className="folio-cover"><b>ScholarSAT</b><MoonPrint /><strong>Practice<br/>edition</strong></div>}
        back={<div className="folio-photo"><MoonPrint close /><small>13 January · 99.6% illuminated</small></div>} />
      <Leaf front={<div className="printed-page set-imprint"><small>Practice set</small><strong>{skill}</strong><div className="answer-stamps">{Array.from({length:count},(_,i) => <i key={i}>{i+1}</i>)}</div><footer>{count} questions</footer></div>}
        back={<div className="printed-page response-print"><small>Mock test</small><strong>Answer sheet</strong><div>{modules.map((m,i) => <section key={i} data-selected={index === i}><small>{moduleName(m,i)}</small><div>{Array.from({length:m.n},(_,n) => <i key={n}/>)}</div></section>)}</div></div>} />
      <Leaf front={<div className="printed-page module-imprint" key={index}><small>Module {index%2+1}</small><strong>{part.section === "rw" ? "Reading & writing" : "Math"}</strong><div className="print-clock">{part.minutes}<small>minutes</small></div><footer>{part.n} questions</footer></div>}
        back={<div className="printed-page proof-print"><small>Passage excerpt</small><p>{claim}</p><p><mark>For example,</mark> {example}</p></div>} />
      <Leaf front={<div className="printed-page proof-key"><small>Reading & writing</small><strong>Transitions</strong><p>Several cultures</p><i>↓</i><p>One example</p><footer>Babylonian astronomers</footer></div>}
        back={<div className="folio-cover back-cover"><Owl size={74} mood="still"/><strong>ScholarSAT</strong></div>} />
    </div>
  </div>;
}
