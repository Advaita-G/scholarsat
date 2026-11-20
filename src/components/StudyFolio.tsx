"use client";

import { useEffect, useRef, type ReactNode } from "react";

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function StudyFolio({pages, chapter, onChapter}: {
  pages: {front: ReactNode; back: ReactNode}[];
  chapter: number;
  onChapter: (index: number) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = stage.current!;
    const story = frame.closest(".study-desk")!;
    const binding = frame.querySelector<HTMLElement>(".folio-binding")!;
    const panels = Array.from(story.querySelectorAll<HTMLElement>(".book-stop"));
    const leaves = Array.from(frame.querySelectorAll<HTMLElement>(".folio-leaf"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let stops: number[] = [];
    let raf = 0;
    let previous = -1;
    let entryStart = 0;
    let lastApproach = -1;
    let grip: {id: number; x: number; y: number; start: number; width: number; forward: boolean; dragged: boolean} | null = null;
    const reduced = () => motion.matches || document.documentElement.classList.contains("reduce-motion");
    function paint() {
      raf = 0;
      let position = 0;
      for (let i=0; i<leaves.length; i++) position += clamp((scrollY-stops[i]) / Math.max(1,stops[i+1]-stops[i]));
      if (reduced()) position = Math.round(position);
      const approach = reduced() ? 1 : clamp((scrollY-entryStart) / Math.max(1, stops[0]-entryStart));
      if (approach !== lastApproach) {
        lastApproach = approach;
        frame.dataset.exposing = String(approach < 1);
        frame.style.setProperty("--approach", String(approach * approach * (3 - 2 * approach)));
      }
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
        onChapter(spread);
      }
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(paint); }
    function measure() {
      const top = story.getBoundingClientRect().top + scrollY;
      entryStart = top - innerHeight * .65;
      frame.style.setProperty("--jacket-width", binding.offsetWidth + "px");
      frame.style.setProperty("--jacket-height", binding.offsetHeight + "px");
      stops = [top + innerHeight * .30, ...panels.map(el => el.getBoundingClientRect().top + scrollY)];
      schedule();
    }
    function seek(position: number, settle = false) {
      const p = Math.max(0, Math.min(leaves.length,position));
      const i = Math.min(leaves.length - 1, Math.floor(p));
      const top = stops[i] + (stops[i+1]-stops[i])*(p-i);
      window.scrollTo({top, behavior: settle && !reduced() ? "smooth" : "instant"});
    }
    function press(e: PointerEvent) {
      if (!e.isPrimary || e.button !== 0 || !(e.target instanceof Element) || !e.target.closest(".folio-leaf") || e.target.closest("a, button, label, input, select")) return;
      const rect = binding.getBoundingClientRect();
      const start = Math.max(0,previous);
      grip = { id:e.pointerId, x:e.clientX, y:e.clientY, start, width:rect.width,
        forward:start < .5 || (start < leaves.length-.5 && e.clientX >= rect.left), dragged:false };
      frame.setPointerCapture(e.pointerId);
      frame.dataset.held = "true";
      frame.style.setProperty("--grip-y", `${clamp((e.clientY-rect.top)/rect.height)*100}%`);
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
      if (e.target !== frame) return;
      const step = Math.round(previous);
      const keys: Record<string,number> = {ArrowRight:step+1, ArrowLeft:step-1, ArrowUp:step+1, ArrowDown:step-1, Home:0, End:leaves.length};
      if (!(e.key in keys)) return;
      e.preventDefault();
      seek(keys[e.key],true);
    }
    const resize = new ResizeObserver(measure);
    [story,binding,document.body,...panels].forEach(el => resize.observe(el));
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

  return <div ref={stage} className="folio-stage" tabIndex={0} role="group" aria-label="Practice book. Use left and right arrows to turn pages.">
    <div className="folio-binding">
      {pages.map(({front, back}, i) => <div className="folio-leaf" key={i}>
        <div className="leaf-face" inert={chapter !== i} aria-hidden={chapter !== i}>{front}</div>
        <div className="leaf-face leaf-reverse" inert={chapter !== i + 1} aria-hidden={chapter !== i + 1}>{back}</div>
      </div>)}
    </div>
    <div className="cover-exposure" aria-hidden="true">
      <div className="exposure-credit">Apollo 17 <span>Station 6 · NASA</span></div>
    </div>
  </div>;
}
