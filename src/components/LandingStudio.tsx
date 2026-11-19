import Link from "next/link";
import { LandingQuestion, type LandingItem } from "./LandingQuestion";
import { PencilPlot } from "./PencilPlot";

export function LandingStudio({ items }: { items: LandingItem[] }) {
  return (
    <>
      <section className="practice-cover" aria-labelledby="landing-title">
        <div className="cover-spread prep-width">
          <div className="cover-type">
            <h1 id="landing-title" aria-label="Free SAT practice"><span><b>Free SAT</b></span><span><b>practice.</b></span></h1>
            <p>Math, reading, and writing. Try a question and see how the answer works.</p>
            <div className="cover-actions">
              <a className="folio-button" href="#sample">Try a question <span aria-hidden="true">↓</span></a>
              <Link className="folio-link" href="/practice">Browse the bank <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <figure className="cover-graph">
            <PencilPlot />
            <figcaption><Link href="/practice/play?section=math&skill=Nonlinear+functions&limit=5">Practice nonlinear functions <span aria-hidden="true">↗</span></Link><span>y = x²/4 − 1</span></figcaption>
          </figure>
        </div>
      </section>
      <section className="practice-stage" aria-label="Sample SAT practice"><LandingQuestion items={items} /></section>
    </>
  );
}
