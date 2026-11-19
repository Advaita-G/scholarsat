"use client";
import { useEffect, useRef, useState } from "react";

const solids = ["Sphere", "Cone", "Cylinder"] as const;
type Solid = (typeof solids)[number];
function radius(solid: Solid, y: number) {
  if (solid === "Cone") return (1 - y) / 2;
  if (solid === "Cylinder") return 1;
  return Math.sqrt(Math.max(0, 1 - y * y));
}

export function SolidStudy() {
  const automatic = useRef(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [solid, setSolid] = useState<Solid>("Sphere");
  const [height, setHeight] = useState(50);
  const [paused, setPaused] = useState(false);
  const controls = useRef({ solid, height, paused });
  const redraw = useRef<() => void>(() => {});
  useEffect(() => {
    controls.current = { solid, height, paused };
    redraw.current();
  }, [solid, height, paused]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!ctx || !el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const rings = 32;
    const radii = Array.from({ length: rings + 1 }, (_, i) =>
      radius("Sphere", (2 * i) / rings - 1),
    );
    let frame = 0,
      last = 0,
      time = 0,
      slice = 0.5,
      visible = true,
      width = 0,
      heightPx = 0,
      sinceChange = 0,
      travel = 0;
    function followScroll() {
      if (el && visible)
        travel = Math.min(
          1,
          Math.max(0, -el.getBoundingClientRect().top / Math.max(1, heightPx)),
        );
    }
    function draw(now: number) {
      if (!ctx || !el) return;
      frame = 0;
      const still =
        controls.current.paused ||
        media.matches ||
        document.documentElement.classList.contains("reduce-motion");
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (!still) {
        time += dt;
        sinceChange += dt;
        if (automatic.current && sinceChange >= 5.5) {
          sinceChange = 0;
          setSolid(
            (current) => solids[(solids.indexOf(current) + 1) % solids.length],
          );
        }
      }
      const ease = still ? 1 : 1 - Math.exp(-Math.max(dt, 0.016) * 11);
      slice += (controls.current.height / 100 - slice) * ease;
      const scale = Math.min(width * 0.338, heightPx * 0.327);
      const tilt =
        -0.29 + 0.075 * Math.sin(time * 0.55) + (still ? 0 : travel * 0.24);
      ctx.clearRect(0, 0, width, heightPx);
      ctx.save();
      ctx.translate(width * 0.5, heightPx * 0.5);
      ctx.rotate(tilt);
      const angle = 0.28 + 0.075 * Math.sin(time * 0.43);
      // Draw from bottom to top so each machined ring occludes the one behind it.
      for (let i = 0; i <= rings; i++) {
        const t = i / rings,
          y = 2 * t - 1;
        radii[i] += (radius(controls.current.solid, y) - radii[i]) * ease;
        const r = Math.max(1, radii[i] * scale);
        const gap =
          scale *
          (0.2 + 0.08 * Math.sin(time * 0.9) + (still ? 0 : travel * 0.25));
        const cy = -y * scale * 0.91 + (t < slice ? gap : -gap);
        const marked = i === Math.round(slice * rings);
        const ry = r * angle;
        ctx.save();
        const assembly = still
          ? 1
          : 1 -
            Math.pow(1 - Math.min(1, Math.max(0, (time - t * 0.22) / 1.05)), 3);
        ctx.translate(
          (1 - assembly) * (t - 0.45) * scale * 1.3,
          cy + (1 - assembly) * (t - 0.5) * scale * 0.7,
        );
        ctx.globalAlpha = 0.15 + 0.85 * assembly;
        const gradient = ctx.createLinearGradient(-r, 0, r, 0);
        gradient.addColorStop(0, marked ? "#fff1f9" : "#fca8c3");
        gradient.addColorStop(0.27, marked ? "#ffffff" : "#ffcede");
        gradient.addColorStop(0.62, marked ? "#ffd7e8" : "#ff83a8");
        gradient.addColorStop(1, marked ? "#ffb7d0" : "#bf486e");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, Math.max(1, ry), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = marked ? "#fff6f8" : "#88355b";
        ctx.lineWidth = marked ? 2.4 : 1;
        ctx.stroke();
        // Etched radial lines make the turning cross-section legible.
        ctx.beginPath();
        for (let j = 0; j < 18; j++) {
          const a = time * 0.29 + (j * Math.PI) / 9;
          ctx.moveTo(Math.cos(a) * r * 0.13, Math.sin(a) * ry * 0.13);
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * ry);
        }
        ctx.strokeStyle = "rgba(110,37,78,.24)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      if (!still && visible && !document.hidden)
        frame = requestAnimationFrame(draw);
    }
    function refresh() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function resize() {
      if (!el || !ctx) return;
      const rect = el.getBoundingClientRect(),
        dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      heightPx = rect.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(heightPx * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      refresh();
    }
    redraw.current = refresh;
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    });
    io.observe(el);
    const mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    media.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("scroll", followScroll, { passive: true });
    resize();
    return () => {
      window.removeEventListener("scroll", followScroll);
      cancelAnimationFrame(frame);
      redraw.current = () => {};
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      media.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const area = Math.PI * radius(solid, height / 50 - 1) ** 2;
  return (
    <figure className="solid-study" aria-label="Interactive cross sections">
      <div className="solid-top">
        <span>Cross sections · Radius 1 u</span>
        <button
          type="button"
          className="motion-toggle"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? "Play model animation" : "Pause model animation"}
        >
          {paused ? "▶" : "Ⅱ"}
        </button>
      </div>
      <div className="solid-stage">
        <canvas
          ref={canvas}
          aria-label={solid + " cut at " + height + " percent of its height"}
          role="img"
        />
        <div className="solid-label" aria-hidden="true">
          A = πr²
        </div>
      </div>
      <div className="shape-switch" aria-label="Select a solid">
        {solids.map((s) => (
          <button
            key={s}
            aria-pressed={s === solid}
            onClick={() => {
              automatic.current = false;
              setSolid(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <figcaption>
        <label htmlFor="slice-level">
          Slice height <b>{height}%</b>
        </label>
        <input
          id="slice-level"
          type="range"
          min="5"
          max="95"
          value={height}
          onChange={(e) => {
            automatic.current = false;
            setHeight(Number(e.target.value));
          }}
        />
        <output>
          Area <b>{area.toFixed(2)} u²</b>
        </output>
      </figcaption>
    </figure>
  );
}
