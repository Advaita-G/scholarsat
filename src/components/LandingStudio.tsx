import Link from "next/link";
import { LandingQuestion, type LandingItem } from "./LandingQuestion";

export function LandingStudio({ items }: { items: LandingItem[] }) {
  return (
    <section className="practice-stage" aria-labelledby="landing-title">
      <div className="prep-width">
        <div className="stage-intro">
          <div>
            <p className="folio-meta">Free digital SAT prep</p>
            <h1 id="landing-title">Work it out.</h1>
          </div>
          <div className="stage-actions">
            <p>Practice questions, worked answers, and full-length mock tests.</p>
            <Link className="folio-button" href="/practice">
              Start practicing <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        {items.length > 0 && <LandingQuestion items={items} />}
      </div>
    </section>
  );
}
