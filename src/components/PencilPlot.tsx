"use client";

import { useEffect, useRef } from "react";

// Plot y = x²/4 − 1 with a 40-unit grid and origin (230, 280).
function position(x: number) { return 320 - (x - 230) ** 2 / 160; }
function curve(x: number) {
  const start = 50;
  const controlY = position(start) + (x - start) * (230 - start) / 160;
  return `M${start} ${position(start)} Q${(start + x) / 2} ${controlY} ${x} ${position(x)}`;
}

export function PencilPlot() {
  const graph = useRef<SVGSVGElement>(null);
  const trace = useRef<SVGPathElement>(null);
  const pencil = useRef<SVGGElement>(null);
  const vertex = useRef<SVGGElement>(null);
  useEffect(() => {
    const scene = graph.current?.closest("section");
    if (!scene) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const start = performance.now();
    let frame = 0;
    function draw(now: number) {
      frame = 0;
      const still = motion.matches || document.documentElement.classList.contains("reduce-motion");
      const intro = Math.min(1, Math.max(0, (now - start) / 1500));
      const bounds = scene!.getBoundingClientRect();
      const scroll = Math.min(1, Math.max(0, -bounds.top / (bounds.height * .74)));
      const progress = 1 - (1 - intro) ** 3;
      const x = still ? 328 : 50 + 278 * progress + 64 * scroll;
      const angle = still ? -54 : -17 - 37 * progress + 18 * scroll;
      vertex.current?.setAttribute("opacity", String(Math.max(0, Math.min(1, (x - 230) / 35))));
      trace.current?.setAttribute("d", curve(x));
      pencil.current?.setAttribute("transform", `translate(${x} ${position(x)}) rotate(${angle})`);
      if (!still && intro < 1) frame = requestAnimationFrame(draw);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <svg className="pencil-plot" ref={graph} viewBox="0 0 600 400" aria-hidden="true">
      <defs>
        <radialGradient id="graph-fade"><stop offset=".58" stopColor="white"/><stop offset="1" stopColor="#555"/></radialGradient>
        <mask id="grid-edge"><rect width="600" height="400" fill="url(#graph-fade)"/></mask>
        <pattern id="plot-grid" x="30" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 40V0H40" fill="none" stroke="currentColor" opacity=".22" /></pattern>
        <linearGradient id="silver" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#56585b"/><stop offset=".22" stopColor="#fbfaf5"/><stop offset=".45" stopColor="#969795"/><stop offset=".65" stopColor="#edece7"/><stop offset="1" stopColor="#393b3d"/></linearGradient>
        <linearGradient id="wood" x2="0" y2="1"><stop stopColor="#c18b5b"/><stop offset=".4" stopColor="#f1d1a0"/><stop offset="1" stopColor="#a56e43"/></linearGradient>
      </defs>
      <rect x="30" y="40" width="540" height="320" fill="url(#plot-grid)" mask="url(#grid-edge)" />
      <path d="M30 280H574m-6 -3 6 3 -6 3M230 360V34m-3 6 3 -6 3 6" fill="none" stroke="currentColor" opacity=".56"/>
      <g fill="currentColor" fontFamily="monospace" fontSize="12"><text x="581" y="284">x</text><text x="238" y="40">y</text><text x="143" y="298">−2</text><text x="304" y="298">2</text><text x="212" y="298">0</text></g>
      <path d={curve(420)} fill="none" stroke="currentColor" opacity=".28" strokeDasharray="2 5"/>
      <g ref={vertex} fill="currentColor">
        <path d="M230 325v13h15" fill="none" stroke="currentColor" opacity=".55"/>
        <text x="250" y="343" fontFamily="monospace" fontSize="12">(0, −1)</text>
        <circle cx="230" cy="320" r="4" fill="#cc3324"/>
      </g>
      <path ref={trace} d={curve(328)} stroke="#d22d24" fill="none" strokeWidth="3" strokeLinecap="round"/>
      <g ref={pencil} transform={`translate(328 ${position(328)}) rotate(-54)`}>
        <path d="M4 4 65 -9H320Q339 -9 339 7V15Q337 24 323 24H64Z" fill="#292922" opacity=".09" transform="skewY(2)"/>
        <path d="M0 0 59 -17H285V17H59Z" fill="url(#wood)"/>
        <path d="M0 0 16 -4.6 19 -1 16 4.6Z" fill="#272a2a"/>
        <path d="M59 -17H288V-6H51Q59 -12 59 -17Z" fill="#ff6651"/>
        <path d="M51 -6H288V7H51Q61 1 51 -6Z" fill="#d62921"/>
        <path d="M51 7H288V17H59Q60 12 51 7Z" fill="#972219"/>
        <path d="M62 -15H282" stroke="#ffaf94"/>
        <text x="87" y="4" fontFamily="monospace" fontSize="9" letterSpacing="2" fill="#fff0d8">SCHOLARSAT</text>
        <text x="247" y="4" fontFamily="monospace" fontSize="9" fill="#fff0d8">2B</text>
        <path d="M307 -16H325Q339 -16 339 -4V4Q339 16 325 16H307Z" fill="#b96564"/>
        <path d="M311 -12H326Q333 -12 334 -7" fill="none" stroke="#e29c91" strokeWidth="3"/>
        <rect x="283" y="-18" width="30" height="36" rx="2" fill="url(#silver)"/>
        {[286, 290, 305, 309].map(x => <path key={x} d={`M${x} -17v34`} stroke="#353639" opacity=".45"/>)}
      </g>
    </svg>
  );
}
