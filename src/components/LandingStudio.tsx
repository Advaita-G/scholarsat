import Link from "next/link";
import { LandingQuestion, type LandingItem } from "./LandingQuestion";

export function LandingStudio({ items }: { items: LandingItem[] }) {
  return (
    <section className="practice-stage prep-width" aria-labelledby="landing-title">
      <div className="stage-intro">
        <div>
          <h1 id="landing-title">Free SAT practice.</h1>
          <p>Questions, explanations, and full-length mock tests.</p>
        </div>
        <Link className="folio-button" href="/practice">
          Start practicing <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <LandingQuestion items={items} />
    </section>
  );
}
