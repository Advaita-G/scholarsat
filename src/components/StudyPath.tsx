"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function StudyPath() {
  const graphic = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = graphic.current!;
    const main = svg.parentElement!;
    const cover = main.querySelector<HTMLElement>(".atlas-cover")!;
    const passage = main.querySelector<HTMLElement>(".reading-spread")!;
    const desk = main.querySelector<HTMLElement>(".study-desk")!;
    const entry = main.querySelector<HTMLElement>(".entry-port")!;
    const moons = Array.from(main.querySelectorAll<HTMLElement>(".exposure-origin"));
    const lines = Array.from(svg.querySelectorAll<SVGPathElement>(".path-ink"));
    const dot = svg.querySelector("circle")!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lengths: number[] = [];
    let stops: number[] = [];

    function draw() {
      frame = 0;
      const still = motion.matches || document.documentElement.classList.contains("reduce-motion");
      let active = 0;
      let distance = 0;
      lines.forEach((line, i) => {
        const progress = clamp((scrollY - stops[i]) / Math.max(1, stops[i+1] - stops[i]));
        line.style.strokeDashoffset = String(still ? 0 : 1-progress);
        if (progress > 0) { active = i; distance = lengths[i] * progress; }
      });
      const point = lines[active].getPointAtLength(distance);
      dot.setAttribute("cx", String(point.x));
      dot.setAttribute("cy", String(point.y));
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    function measure() {
      const base = main.getBoundingClientRect();
      const zoom = base.width / parseFloat(getComputedStyle(main).width);
      const local = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { x: (r.left-base.left)/zoom, y: (r.top-base.top)/zoom, w:r.width/zoom, h:r.height/zoom };
      };
      const centers = moons.map(el => {
        const r = local(el);
        return {x:r.x+r.w/2, y:r.y+r.h/2};
      }).reverse();
      const sheet = local(cover), spread = local(passage), bank = local(desk), port = local(entry);
      const left = sheet.x * .52, right = base.width/zoom-left;
      const seam = bank.y - 5;
      const radius = Math.min(23, sheet.x * .32);
      const x = port.x + port.w/2, y = port.y + port.h/2;
      let arc = `M ${centers[0].x} ${centers[0].y}`;
      for (let i=1; i<centers.length; i++) {
        const from = centers[i-1], to = centers[i], mid = (from.x+to.x)/2;
        arc += ` C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}`;
      }
      arc += ` H ${left+radius} Q ${left} ${centers[3].y} ${left} ${centers[3].y+radius} V ${spread.y}`;
      const paths = [
        arc,
        `M ${left} ${spread.y} V ${seam-radius} Q ${left} ${seam} ${left+radius} ${seam} H ${right-radius} Q ${right} ${seam} ${right} ${seam+radius}`,
        `M ${right} ${seam+radius} V ${y-radius} Q ${right} ${y} ${right-radius} ${y} H ${x}`,
      ];
      lengths = paths.map((path,i) => {
        lines[i].setAttribute("d",path);
        return lines[i].getTotalLength();
      });
      const max = Math.max(3, document.documentElement.scrollHeight - innerHeight);
      const end = Math.min(max, Math.max(3, entry.getBoundingClientRect().bottom + scrollY - innerHeight * .78));
      const second = Math.min(end-1, Math.max(2, desk.getBoundingClientRect().top + scrollY - innerHeight * .63));
      const first = Math.min(second-1, Math.max(1, passage.getBoundingClientRect().top + scrollY - innerHeight * .55));
      stops = [0,first,second,end];
      schedule();
    }
    measure();
    const observer = new ResizeObserver(measure);
    [main,cover,passage,desk,entry,document.body].forEach(el => observer.observe(el));
    const preference = new MutationObserver(schedule);
    preference.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",measure);
    motion.addEventListener("change",schedule);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); preference.disconnect();
      window.removeEventListener("scroll",schedule); window.removeEventListener("resize",measure);
      motion.removeEventListener("change",schedule);
    };
  }, []);
  return <svg className="study-path" ref={graphic} aria-hidden="true" focusable="false">
    {[0,1,2].map(i => <path key={i} className="path-ink" pathLength="1" />)}
    <circle r="3.4" />
  </svg>;
}
