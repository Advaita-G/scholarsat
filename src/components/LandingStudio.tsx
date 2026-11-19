import Link from "next/link";
import { TypeSculpture } from "./TypeSculpture";

export function LandingStudio() {
  return (
    <section className="studio-track" aria-labelledby="landing-title">
      <div className="studio-frame">
        <div className="studio-light" aria-hidden="true" />
        <TypeSculpture />
        <div className="studio-caption prep-width">
          <div>
            <h1 id="landing-title">Free SAT practice.</h1>
            <p>Try a question. Work through the solution.</p>
          </div>
          <div className="cover-actions">
            <a className="studio-start" href="#sample">Try a question <span aria-hidden="true">↓</span></a>
            <Link className="studio-browse" href="/practice">Browse the bank ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
