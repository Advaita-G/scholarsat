import Link from "next/link";
import { getUser } from "@/lib/auth";
import { counts, QUESTIONS } from "@/lib/bank";
import { rich } from "@/lib/render";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { VOCAB } from "@/data/vocab";
import { Logo } from "@/components/Logo";
import { type LandingItem } from "@/components/LandingQuestion";
import { SolidStudy } from "@/components/SolidStudy";
import { LandingStudio } from "@/components/LandingStudio";
import { CountUp, Reveal } from "@/components/Reveal";
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
      topic: `${q.section === "math" ? "Math" : "Reading and Writing"}, ${q.domain}`,
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
    <div className="sat-lab">
      <div className="lab-blue">
        <header className="lab-nav">
          <Logo size={34} light />
          <nav aria-label="Main navigation">
            <Link href="/practice">Question bank</Link>
            <Link href="/vocab">Vocabulary</Link>
            <Link href={user ? "/dashboard" : "/login"}>
              {user ? "Dashboard" : "Log in"} ↗
            </Link>
          </nav>
        </header>
        <main className="lab-hero">
          <div className="lab-copy">
            <h1>
              <span>
                <b>Digital SAT</b>
              </span>
              <span>
                <b>practice.</b>
              </span>
            </h1>
            <p>
              Work through a math problem, find the clue in a passage, or sit
              for a timed test. Pick where you want to start.
            </p>
            <div className="lab-actions">
              <Link className="lab-primary" href="/practice">
                Start practicing <i aria-hidden="true">↗</i>
              </Link>
              <a href="#sample">Try a question ↓</a>
            </div>
          </div>
          <SolidStudy />
        </main>
        <div className="lab-foot">
          <span>Free to study · Open source</span>
          <a href={CODESTARTERS}>Made by CodeStarters ↗</a>
        </div>
      </div>
      <section className="lab-sample" id="sample">
        <Reveal>
          <LandingStudio items={sampleItems()} />
        </Reveal>
      </section>
      <section className="lab-library" aria-label="Study library">
        <Reveal className="library-inner">
          <div className="library-count">
            <span className="big-count">
              <CountUp to={bank.total} />
            </span>
            <h2>Practice questions</h2>
            <p>
              Filter by skill, subject, or difficulty. Every answer comes with a
              worked explanation.
            </p>
            <Link href="/practice">Explore the bank ↗</Link>
          </div>
          <div className="library-routes">
            {[
              [
                "/vocab",
                "Vocabulary studio",
                VOCAB.length.toLocaleString() + " words",
              ],
              ["/tests", "Timed practice tests", "Adaptive modules"],
              ["/resources", "Study resources", "Official material"],
            ].map(([href, label, desc]) => (
              <Link key={href} href={href}>
                <span>{desc}</span>
                <b>{label}</b>
                <i aria-hidden="true">↗</i>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="lab-notes">
        <Reveal>
          <h2>Before you begin</h2>
          {[
            [
              "Do I need an account?",
              "Practice questions and vocabulary work as a guest. Create an account to save progress and take full-length tests.",
            ],
            [
              "What does it cost?",
              "Practice, vocabulary, tests, and worked explanations are free. The optional AI tutor uses your ChatGPT plan or OpenAI API billing.",
            ],
            [
              "Are these official SAT questions?",
              "CodeStarters creates original practice material. ScholarSAT is independent of College Board. The resource library links to official practice.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </Reveal>
      </section>
      <footer className="lab-footer">
        <div>
          <Logo size={34} light />
          <nav aria-label="Footer">
            <a href={REPO}>GitHub</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
        <a className="footer-start" href="/practice">
          Start practicing <i aria-hidden="true">↗</i>
        </a>
      </footer>
    </div>
  );
}
