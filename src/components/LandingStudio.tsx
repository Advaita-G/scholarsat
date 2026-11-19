"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { LandingQuestion, type FeaturedQuestion } from "./LandingQuestion";

const phases = [
  { frame: "0061", day: "03", lit: "14.6%", phase: "Waxing crescent" },
  { frame: "0133", day: "06", lit: "44.5%", phase: "Near first quarter" },
  { frame: "0217", day: "10", lit: "81.7%", phase: "Waxing gibbous" },
  { frame: "0301", day: "13", lit: "99.6%", phase: "Near full moon" },
];

export function LandingStudio({question}: { question: FeaturedQuestion }) {
  const story = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = story.current!;
    const cover = root.querySelector<HTMLElement>(".atlas-cover")!;
    const origins = Array.from(root.querySelectorAll<HTMLElement>(".exposure-origin"));
    const plates = origins.map(origin => origin.querySelector<HTMLElement>("figure")!);
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".archive-slot"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let distances: {x: number; y: number; scale: number}[] = [];
    function draw() {
      frame = 0;
      const rect = cover.getBoundingClientRect();
      const availableScroll = document.documentElement.scrollHeight - innerHeight - (rect.top + scrollY);
      const travel = Math.max(1, Math.min(rect.height * .91, availableScroll));
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const still = motion.matches || document.documentElement.classList.contains("reduce-motion");
      const t = progress * progress * (3 - 2 * progress);
      root.dataset.motion = still ? "still" : "on";
      root.style.setProperty("--progress", String(still ? 0 : t));
      plates.forEach((plate,i) => {
        const { x, y, scale } = distances[i];
        plate.style.transform = still ? "" : `translate3d(${x*t}px,${y*t}px,0) scale(${1+(scale-1)*t})`;
      });
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function measure() {
      distances = origins.map((origin,i) => {
        const a = origin.getBoundingClientRect(), b = targets[i].getBoundingClientRect();
        // The app zooms its root on large screens. DOM rects include that zoom, CSS translations do not.
        const zoom = a.width / parseFloat(getComputedStyle(origin).width);
        return { x: (b.left-a.left)/zoom, y: (b.top-a.top)/zoom, scale: b.width/a.width };
      });
      schedule();
    }
    measure();
    const observer = new ResizeObserver(measure);
    [cover, ...origins, ...targets, root].forEach(el => observer.observe(el));
    const preferences = new MutationObserver(schedule);
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    addEventListener("scroll",schedule,{ passive:true });
    motion.addEventListener("change",schedule);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); preferences.disconnect(); removeEventListener("scroll",schedule); motion.removeEventListener("change",schedule); };
  }, []);
  return (
    <article className="atlas measure" ref={story}>
      <header className="atlas-cover">
        <div className="cover-copy">
          <p className="overline"><span className="signal-dot" />Free SAT practice <span>/</span> Reading &amp; writing</p>
          <h1>Reading <br />the Moon.</h1>
          <p className="cover-deck">Ancient astronomers kept time by the Moon. Find the missing connection in their story.</p>
          <a className="read-action" href="#passage"><span className="action-arrow" aria-hidden="true">↓</span>Enter the passage</a>
        </div>
        <div className="exposure-field" aria-hidden="true">
          {phases.map(p => <div className="exposure-origin" key={p.frame}><figure>
            <Image unoptimized className="moon-disc" src={`/landing/lunar/${p.frame}.webp`} alt="" width={500} height={500} loading="eager" draggable="false" />
            {p === phases[3] && <div className="phase-development">
              {phases.slice(0,3).map((earlier,i) => <Image unoptimized key={earlier.frame} src={`/landing/lunar/${earlier.frame}.webp`} alt="" width={500} height={500} loading="eager" style={{animationDelay: `${i * .58}s`, zIndex: 3-i}} />)}
            </div>}
          </figure><span className="exposure-date">{p.day} Jan <b>/ {p.lit}</b></span></div>)}
        </div>
        <div className="plate-index"><span>Lunar illumination</span><span className="plate-rule" /><span>03—13 Jan 2025</span></div>
      </header>
      <section id="passage" className="reading-spread" aria-labelledby="passage-title">
        <figure className="lunar-archive" aria-label="Four observations of the waxing Moon, from crescent to nearly full">
          <div className="archive-strip">{phases.map(p => <div key={p.frame}>
            <div className="archive-slot"><Image unoptimized src={`/landing/lunar/${p.frame}.webp`} alt={p.phase} width={120} height={120} /></div>
            <span>Jan {p.day}</span>
          </div>)}</div>
          <figcaption>Moon phase sequence, January 2025.<br /><a href="https://svs.gsfc.nasa.gov/5415/">NASA Goddard / Ernie Wright ↗</a></figcaption>
        </figure>
        <LandingQuestion question={question} />
      </section>
    </article>
  );
}
