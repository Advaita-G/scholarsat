import type { CSSProperties } from "react";

export type WorkKind = "systems" | "grammar" | "percentages" | "vocabulary";

export function LandingWork({ work }: { work: "systems" | "percentages" }) {
  return (
    <div className="exam-work" aria-hidden="true">
      <div className="work-top folio-meta">
        <span>Scratchpad</span>
        <span>Worked solution</span>
      </div>

      {work === "systems" && (
        <div className="work-figure">
          <div className="plot-key">
            <span>4x + 3y = 9</span>
            <span>3x − y = 10</span>
          </div>
          <svg viewBox="0 0 356 286" className="work-plot">
            <g className="plot-axis">
              <path d="M19 150H337m-5-4 5 4-5 4M68 275V27m-4 5 4-5 4 5" />
              <path d="M112 146v8m44-8v8m44-8v8m44-8v8m44-8v8M64 86h8m-8 32h8m-8 64h8m-8 32h8" />
            </g>
            <g className="plot-ticks">
              <text x="342" y="154">x</text>
              <text x="62" y="19">y</text>
              <text x="55" y="93" textAnchor="end">4</text>
              <text x="55" y="220" textAnchor="end">−4</text>
              <text x="112" y="139" textAnchor="middle">1</text>
              <text x="156" y="139" textAnchor="middle">2</text>
              <text x="200" y="139" textAnchor="middle">3</text>
              <text x="244" y="139" textAnchor="middle">4</text>
              <text x="288" y="139" textAnchor="middle">5</text>
            </g>
            <path className="plot-line" d="M24 80.67 332 230" pathLength="1" />
            <path className="plot-line plot-line-red" d="M112 262 317.33 38" pathLength="1" />
            <g className="plot-solution">
              <path className="plot-guide" d="M68 166H200V150" pathLength="1" />
              <path className="plot-ring" d="M214 158c-6-9-19-9-26 1-9 15 10 29 22 18 5-4 7-11 4-18" pathLength="1" />
              <circle cx="200" cy="166" r="3" />
              <text className="plot-coordinate" x="221" y="189">(3, −1)</text>
            </g>
          </svg>
          <p className="work-ledger">3 + (−1) = 2</p>
        </div>
      )}

      {work === "percentages" && (
        <div className="work-figure work-percents">
          <div style={{ "--length": "80%" } as CSSProperties}><span>Original price</span><strong>$100</strong></div>
          <div style={{ "--length": "100%" } as CSSProperties}><span>After +25%</span><strong>$125</strong></div>
          <div style={{ "--length": "90%" } as CSSProperties}><span>After −10%</span><strong>$112.50</strong></div>
          <p className="work-ledger">112.5% of the original</p>
        </div>
      )}

    </div>
  );
}
