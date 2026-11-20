"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { moduleName, type TestModule } from "./TestTiming";

function Leaf({front, back}: {front: ReactNode; back: ReactNode}) {
  return <div className="folio-leaf"><div className="leaf-face">{front}</div><div className="leaf-face leaf-reverse">{back}</div></div>;
}

const spreads = ["Front cover", "Practice set", "Mock test", "Passage notes", "Back cover"];
const clamp = (n: number) => Math.max(0,Math.min(1,n));
export function StudyFolio({modules, index, skill, count, passage, response, solved, onChapter}: {
  modules: TestModule[]; index: number; skill: string; count: number; passage: string; response?: string; solved:boolean; onChapter: (index: number) => void;
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
    let grip: {id: number; x: number; y: number; start: number; width: number; forward: boolean; dragged: boolean} | null = null;
    const reduced = () => motion.matches || document.documentElement.classList.contains("reduce-motion");
    function paint() {
      raf = 0;
      let position = 0;
      for (let i=0; i<leaves.length; i++) position += clamp((scrollY-stops[i]) / Math.max(1,stops[i+1]-stops[i]));
      if (reduced()) position = Math.round(position);
      if (position === previous) return;
      previous = position;
      const turns = leaves.map((leaf,i) => {
        const t = clamp((position-i-.12)/.76);
        const eased = t*t*(3-2*t);
        leaf.style.setProperty("--angle", String(-179.7*eased) + "deg");
        const lift = Math.sin(eased * Math.PI);
        leaf.style.setProperty("--shade", String(.24 * lift));
        leaf.style.setProperty("--lift", String(lift));
        leaf.style.zIndex = String(eased > .5 ? i+1 : 12-i);
        return eased;
      });
      frame.style.setProperty("--open", String(turns[0]));
      frame.style.setProperty("--close", String(turns[3]));
      const spread = Math.round(position);
      if (frame.dataset.spread !== String(spread)) {
        frame.dataset.spread = String(spread);
        frame.setAttribute("aria-valuenow", String(spread));
        frame.setAttribute("aria-valuetext", spreads[spread]);
        onChapter(Math.max(0,spread-1));
      }
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(paint); }
    function measure() {
      const mobile = matchMedia("(max-width:760px)").matches;
      const line = innerHeight*(mobile ? .72 : .53);
      stops = panels.map(el => el.getBoundingClientRect().top + scrollY + el.getBoundingClientRect().height/2 - line);
      // Keep the jacket face-on until the entire book has entered the viewport.
      stops.unshift(stops[0] - Math.min(128,innerHeight*.15));
      const limit = document.documentElement.scrollHeight-innerHeight;
      stops[stops.length-1] = Math.min(limit,stops[stops.length-1]);
      schedule();
    }
    function seek(position: number, settle = false) {
      const p = Math.max(0, Math.min(leaves.length,position));
      const i = Math.min(leaves.length - 1, Math.floor(p));
      const top = stops[i] + (stops[i+1]-stops[i])*(p-i);
      window.scrollTo({top, behavior: settle && !reduced() ? "smooth" : "instant"});
    }
    function press(e: PointerEvent) {
      if (!e.isPrimary || e.button !== 0 || !(e.target instanceof Element) || !e.target.closest(".folio-leaf")) return;
      const binding = frame.querySelector(".folio-binding")!.getBoundingClientRect();
      const start = Math.max(0,previous);
      grip = { id:e.pointerId, x:e.clientX, y:e.clientY, start, width:binding.width,
        forward:start < .5 || (start < leaves.length-.5 && e.clientX >= binding.left), dragged:false };
      frame.setPointerCapture(e.pointerId);
      frame.dataset.held = "true";
      frame.style.setProperty("--grip-y", `${clamp((e.clientY-binding.top)/binding.height)*100}%`);
    }
    function release() {
      if (grip && frame.hasPointerCapture(grip.id)) frame.releasePointerCapture(grip.id);
      grip = null;
      delete frame.dataset.held;
    }
    function pull(e: PointerEvent) {
      if (!grip || grip.id !== e.pointerId) return;
      const dx = grip.x - e.clientX, dy = e.clientY - grip.y;
      if (!grip.dragged && Math.abs(dy)>8 && Math.abs(dy)>Math.abs(dx)) { release(); return; }
      if (Math.abs(dx)>4) grip.dragged = true;
      if (grip.dragged) seek(grip.start + dx/grip.width);
    }
    function finish(e: PointerEvent) {
      if (!grip || grip.id !== e.pointerId) return;
      const delta = (grip.x-e.clientX)/grip.width;
      const target = grip.dragged
        ? Math.round(grip.start + delta + (Math.abs(delta) > .18 ? Math.sign(delta)*.31 : 0))
        : Math.round(grip.start) + (grip.forward ? 1 : -1);
      release();
      seek(target,true);
    }
    function key(e: KeyboardEvent) {
      const step = Math.round(previous);
      const keys: Record<string,number> = {ArrowRight:step+1, ArrowLeft:step-1, ArrowUp:step+1, ArrowDown:step-1, Home:0, End:leaves.length};
      if (!(e.key in keys)) return;
      e.preventDefault();
      seek(keys[e.key],true);
    }
    const resize = new ResizeObserver(measure);
    [story,document.body,...panels].forEach(el => resize.observe(el));
    const prefs = new MutationObserver(schedule);
    prefs.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    measure();
    frame.addEventListener("pointerdown",press);
    frame.addEventListener("pointermove",pull);
    frame.addEventListener("pointerup",finish);
    frame.addEventListener("lostpointercapture",release);
    frame.addEventListener("pointercancel",release);
    frame.addEventListener("keydown",key);
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",measure);
    motion.addEventListener("change",schedule);
    return () => {
      frame.removeEventListener("pointerdown",press);
      frame.removeEventListener("pointermove",pull);
      frame.removeEventListener("pointerup",finish);
      frame.removeEventListener("lostpointercapture",release);
      frame.removeEventListener("pointercancel",release);
      frame.removeEventListener("keydown",key);
      resize.disconnect(); prefs.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("scroll",schedule); window.removeEventListener("resize",measure); motion.removeEventListener("change",schedule); };
  }, [onChapter]);
  const part = modules[index];
  const [claim, example] = passage.split(/\s*_{4,}\s*/);
  return <div ref={stage} className="folio-stage" role="slider" tabIndex={0} aria-label="Turn the book pages"
    aria-valuemin={0} aria-valuemax={4} aria-valuenow={0} aria-valuetext="Front cover" aria-describedby="folio-gesture">
    <div className="folio-binding" aria-hidden="true">
      <Leaf front={
        <div className="folio-cover front-cover">
          <strong>ScholarSAT</strong>
          <p>Practice book</p>
          <Image className="jacket-plate" src="/landing/lunar/apollo-17-station-6.webp" width={880} height={912} alt="" />
          <small>Apollo 17 <span>Station 6</span></small>
        </div>
      } back={
        <div className="printed-page landscape-page">
          <small>Lunar panorama</small>
          <strong>Taurus–Littrow</strong>
          <div className="panorama-half panorama-left" />
          <footer>Apollo 17 · NASA</footer>
        </div>
      } />
      <Leaf front={
        <div className="printed-page set-imprint" data-long-title={skill.length > 42}>
          <small>Practice set</small><strong>{skill}</strong>
          <div className="panorama-half panorama-right" />
          <footer>{count} questions</footer>
        </div>
      } back={
        <div className="printed-page response-print">
          <small>Mock test</small><strong>Answer sheet</strong>
          <div className="module-register">
            {modules.map((m,i) => <section key={i} data-selected={index === i}>
              <small>{moduleName(m,i)}</small>
              <div>{Array.from({length:m.n},(_,n) => <i key={n}/>)}</div>
            </section>)}
          </div>
        </div>
      } />
      <Leaf front={
        <div className="printed-page module-imprint" key={index}>
          <small>Module {index%2+1}</small>
          <strong>{part.section === "rw" ? "Reading & writing" : "Math"}</strong>
          <div className="print-clock">{part.minutes}<span>min</span></div>
          <footer>{part.n} questions</footer>
        </div>
      } back={
        <div className="printed-page proof-print">
          <small>Reading & writing</small><strong>Reading the Moon</strong>
          <p>{claim}</p><p><mark>{response ?? "_____"}</mark> {example}</p>
        </div>
      } />
      <Leaf front={
        <div className="printed-page proof-key">
          <small>Passage notes</small><strong>Transitions</strong>
          <dl><dt>{response ? "Your answer" : "General claim"}</dt><dd>{response ?? "Several ancient cultures"}</dd>
          <dt>{response && !solved ? "Look for the example" : "Specific example"}</dt><dd>Babylonian astronomers</dd></dl>
        </div>
      } back={
        <div className="folio-cover back-cover">
          <div className="jacket-credit"><small>Cover photograph</small><p>Eugene A. Cernan, NASA<br/>Taurus–Littrow, 1972</p></div>
          <strong>ScholarSAT</strong>
        </div>
      } />
    </div>
    <span className="folio-gesture" id="folio-gesture">Drag a page, scroll, or use the arrow keys</span>
  </div>;
}
