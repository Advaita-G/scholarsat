import Link from "next/link";
import { getUser } from "@/lib/auth";
import { counts, QUESTIONS } from "@/lib/bank";
import { rich } from "@/lib/render";
import { DIFFICULTY_LABEL } from "@/lib/types";

import { Logo } from "@/components/Logo";
import { type LandingItem } from "@/components/LandingQuestion";
import { LandingNav } from "@/components/LandingNav";
import { LandingShowcase } from "@/components/LandingShowcase";
import { PracticeSetPicker } from "@/components/PracticeSetPicker";
import { LinkButton } from "@/components/ui";
import { TestTiming } from "@/components/TestTiming";
import { MODULES } from "@/lib/tests";
import { LandingStudio } from "@/components/LandingStudio";
import { Reveal } from "@/components/Reveal";
import "@/components/landing.css";

export const dynamic = "force-dynamic";
const REPO =
  process.env.NEXT_PUBLIC_REPO_URL ??
  "https://github.com/Codestarters-Foundation/scholarsat";
const CODESTARTERS = "https://codestarters.org";

const SAMPLE_IDS = ["m30ee0293", "r9980c71a", "m7cf3173b"];

function sampleItems(): LandingItem[] {
  const picked = SAMPLE_IDS.map((id) =>
    QUESTIONS.find((q) => q.id === id),
  ).filter((q) => q !== undefined);
  const pool = picked.length
    ? picked
    : QUESTIONS.filter(
        (q) =>
          q.type === "mcq" && !q.table && !q.passage2 && q.difficulty === "M",
      ).slice(0, 3);
  return pool
    .filter((q) => q.type === "mcq" && q.choices)
    .map((q) => ({
      id: q.id,
      topic: `${q.section === "math" ? "Math" : "Reading and Writing"} · ${q.skill}`,
      difficulty: DIFFICULTY_LABEL[q.difficulty],
      passageHtml: q.passage ? rich(q.passage) : undefined,
      stemHtml: rich(q.stem),
      choicesHtml: q.choices!.map((c) => rich(c)),
      answer: q.answer,
      explanationHtml: rich(q.explanation),
    }));
}

export default async function Landing() {
  const user = await getUser();
  const bank = counts();
  return (
    <div className="lp-root scholar-home">
      <LandingNav signedIn={!!user} repo={REPO} />
      <main>
        <LandingStudio items={sampleItems()} total={bank.total} />
        <section className="prep-width section-space" id="bank">
          <Reveal>
            <div className="prep-heading">
              <h2>Build a five-question set</h2>
              <Link href="/practice">Full question bank →</Link>
            </div>
            <PracticeSetPicker counts={bank.bySkill} />
          </Reveal>
        </section>
        <section className="tour-band" id="tools">
          <div className="prep-width tour-grid">
            <Reveal>
              <h2>Where did you lose points?</h2>
              <p>
                Revisit a missed question, read the explanation, and try it
                again. Your dashboard keeps track of the skills you’ve
                practiced.
              </p>
              <LinkButton href={user ? "/dashboard" : "/signup"}>
                {user ? "Open dashboard" : "Create free account"} →
              </LinkButton>
            </Reveal>
            <Reveal delay={100}>
              <LandingShowcase />
            </Reveal>
          </div>
        </section>
        <div className="prep-width timing-wrap">
          <Reveal>
            <TestTiming modules={MODULES} />
          </Reveal>
          <aside
            id="faq"
            aria-labelledby="access-title"
            className="timing-notes"
          >
            <h2 id="access-title">Before you start</h2>
            <div>
              <p>
                Practice questions and vocabulary are free.{" "}
                <Link href="/signup">Create an account</Link> for saved progress
                and full tests. Optional AI explanations use your own plan or
                API billing.
              </p>
              <p>
                CodeStarters writes the questions independently of College
                Board. For official material, visit the{" "}
                <Link href="/resources">SAT resource library</Link>.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <footer className="prep-width prep-footer">
        <Logo size={32} />
        <nav aria-label="Footer">
          <a href={CODESTARTERS}>CodeStarters</a>
          <a href={REPO}>GitHub</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
