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
        <section className="welcome">
          <div className="welcome-copy">
            <h1>Free SAT prep.</h1>
            <p>
              Study with {bank.total.toLocaleString("en-US")} practice
              questions, adaptive tests, and vocabulary in context.
            </p>
            <div className="welcome-actions">
              <LinkButton href="/practice" size="lg">
                Start practicing →
              </LinkButton>
              <a href="#tests">Practice tests</a>
            </div>
          </div>
          <LandingStudio items={sampleItems()} />
        </section>
        <section className="prep-width section-space" id="bank">
          <Reveal>
            <div className="prep-heading">
              <h2>Practice by skill</h2>
              <Link href="/practice">Full question bank →</Link>
            </div>
            <PracticeSetPicker counts={bank.bySkill} />
          </Reveal>
        </section>
        <section className="tour-band" id="tools">
          <div className="prep-width tour-grid">
            <Reveal>
              <h2>Your study space.</h2>
              <p>
                See the skills you’ve practiced, find the questions that tripped
                you up, and pick up where you left off.
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
        <section id="tests" className="prep-width section-space">
          <Reveal>
            <div className="prep-heading">
              <div>
                <h2>Rehearse test day.</h2>
                <p>
                  Four timed modules. Your second module in each subject adapts
                  to your first.
                </p>
              </div>
              <LinkButton href="/tests" variant="secondary">
                View practice tests →
              </LinkButton>
            </div>
            <ol className="module-track">
              {MODULES.map((m, i) => (
                <li
                  key={i}
                  className={m.section === "rw" ? "reading" : "math"}
                  style={{ "--step": i } as React.CSSProperties}
                >
                  <span>
                    {m.section === "rw" ? "Reading & writing" : "Math"} · Module{" "}
                    {(i % 2) + 1}
                  </span>
                  <strong>
                    {m.minutes}
                    <small> min</small>
                  </strong>
                  <p>{m.n} questions</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>
        <section className="questions-band" id="faq">
          <div className="prep-width questions-grid">
            <div>
              <h2>Common questions</h2>
              <a href="/resources">Browse SAT resources →</a>
            </div>
            <div>
              {[
                [
                  "Can I practice without an account?",
                  "Yes. Use the question bank and vocabulary studio as a guest. A free account saves your progress and gives you access to full-length tests.",
                ],
                [
                  "What’s included for free?",
                  "The question bank, vocabulary studio, practice tests and written explanations. The optional AI tutor uses your own ChatGPT plan or OpenAI API billing.",
                ],
                [
                  "Who makes the questions?",
                  "ScholarSAT is a CodeStarters project with original practice questions. It is independent of College Board. The resource library links to official SAT material.",
                ],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
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
