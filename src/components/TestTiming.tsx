"use client";
import { useRef, useState, type CSSProperties } from "react";
import { LinkButton } from "./ui";
import type { Section } from "@/lib/types";

type Module = { section: Section; minutes: number; n: number };
function timestamp(minutes: number) {
  return Math.floor(minutes / 60) + ":" + String(minutes % 60).padStart(2, "0");
}

export function TestTiming({ modules }: { modules: Module[] }) {
  const [minute, setMinute] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  const boundaries = [0];
  for (const part of modules)
    boundaries.push(boundaries[boundaries.length - 1] + part.minutes);
  const total = boundaries[boundaries.length - 1];
  const index = boundaries.slice(1).findIndex((end) => minute < end);
  const current = modules[index];
  const subject = current?.section === "math" ? "Math" : "Reading and writing";
  const label = current
    ? subject +
      " · Module " +
      modules.slice(0, index + 1).filter((m) => m.section === current.section)
        .length
    : "Test complete";
  const questions = modules.reduce((sum, m) => sum + m.n, 0);
  return (
    <section id="tests" className="timing" aria-labelledby="timing-title">
      <div
        className="timing-scene"
        style={
          { "--slice-light": 60 + (minute / total) * 27 + "%" } as CSSProperties
        }
        ref={scene}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || !scene.current) return;
          const rect = scene.current.getBoundingClientRect();
          scene.current.style.setProperty(
            "--lens-x",
            ((e.clientX - rect.left) / rect.width) * 100 + "%",
          );
          scene.current.style.setProperty(
            "--lens-y",
            ((e.clientY - rect.top) / rect.height) * 100 + "%",
          );
        }}
        onPointerLeave={() => {
          scene.current?.style.removeProperty("--lens-x");
          scene.current?.style.removeProperty("--lens-y");
        }}
      >
        <div className="clock-art" aria-hidden="true" />
        <div className="clock-light" aria-hidden="true" />
        <div className="timing-intro">
          <h2 id="timing-title">The timed SAT</h2>
          <p>
            {questions} questions. {Math.floor(total / 60)} hours and{" "}
            {total % 60} minutes of testing.
          </p>
          <LinkButton href="/tests">View practice tests →</LinkButton>
        </div>
      </div>
      <div className="time-console">
        <div className="time-current">
          <div key={index} className="time-description">
            <h3>{label}</h3>
            <p>
              {current
                ? current.n +
                  " questions in " +
                  current.minutes +
                  " minutes. " +
                  (index > 0 && modules[index - 1].section === current.section
                    ? "Difficulty adapts to your first module."
                    : "This module sets the difficulty of the next.")
                : "All four modules are complete."}
            </p>
          </div>
          <div className="time-transport">
            <button
              type="button"
              aria-label="Previous module"
              disabled={minute === 0}
              onClick={() =>
                setMinute(
                  index < 0
                    ? boundaries[modules.length - 1]
                    : minute > boundaries[index]
                      ? boundaries[index]
                      : boundaries[index - 1],
                )
              }
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next module"
              disabled={index < 0}
              onClick={() => setMinute(boundaries[index + 1])}
            >
              →
            </button>
          </div>
        </div>
        <label htmlFor="test-timeline" className="scrub-instruction">
          Drag to explore test time
        </label>
        <div
          className="time-ruler"
          style={
            {
              "--cursor": (100 * minute) / total + "%",
              "--division": 100 / total + "%",
              "--subject-cut":
                (modules
                  .filter((m) => m.section === "rw")
                  .reduce((sum, m) => sum + m.minutes, 0) /
                  total) *
                  100 +
                "%",
            } as CSSProperties
          }
        >
          <div className="time-bands" aria-hidden="true" />
          <div className="time-needle" aria-hidden="true" />
          <input
            id="test-timeline"
            type="range"
            aria-label="Explore elapsed testing time"
            aria-valuetext={minute + " minutes elapsed, " + label}
            min={0}
            max={total}
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
          />
        </div>
        <div className="time-stamps" aria-hidden="true">
          {boundaries.map((b, i) => (
            <span
              key={b}
              style={{ left: (100 * b) / total + "%" }}
              data-edge={
                i === 0
                  ? "start"
                  : i === boundaries.length - 1
                    ? "end"
                    : undefined
              }
            >
              {timestamp(b)}
            </span>
          ))}
        </div>
        <div className="time-key">
          <span>Reading and writing</span>
          <span>Math</span>
          <output>Elapsed {timestamp(minute)}</output>
        </div>
      </div>
    </section>
  );
}
