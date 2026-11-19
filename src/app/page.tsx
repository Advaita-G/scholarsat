import Link from "next/link";
import { getUser } from "@/lib/auth";
import { counts, QUESTIONS } from "@/lib/bank";
import { rich } from "@/lib/render";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { VOCAB } from "@/data/vocab";
import { Logo } from "@/components/Logo";
import {
  LandingQuestion,
  type LandingItem,
} from "@/components/LandingQuestion";
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
  const entries = [
    [
      "/practice",
      "Question bank",
      "Choose a skill in math or reading and writing.",
      bank.total.toLocaleString() + " questions",
    ],
    [
      "/vocab",
      "Vocabulary studio",
      "Read the passage. Pick a word. Find the evidence.",
      VOCAB.length.toLocaleString() + " words",
    ],
    [
      "/tests",
      "Practice tests",
      "Sit for a timed, adaptive digital SAT.",
      "Full length",
    ],
    [
      "/resources",
      "Resource library",
      "Find official practice material for your next session.",
      "Study guides",
    ],
  ];
  return (
    <div className="edition">
      <header className="edition-nav">
        <Logo size={34} />
        <nav aria-label="Main navigation">
          <a href="#contents">Study guide</a>
          <Link href="/vocab">Vocabulary</Link>
          <Link className="nav-account" href={user ? "/dashboard" : "/login"}>
            {user ? "Dashboard" : "Log in"} →
          </Link>
        </nav>
      </header>
      <main>
        <section className="edition-hero">
          <div className="edition-intro">
            <p className="imprint">
              <span aria-hidden="true" /> A study guide by CodeStarters
            </p>
            <h1>
              The SAT
              <br />
              Practice Book<span aria-hidden="true">.</span>
            </h1>
            <p className="deck">
              An open study guide for the digital SAT. Work through original
              practice problems, unpack tricky words, and see how each answer
              fits.
            </p>
            <div className="edition-actions">
              <Link href="/practice">
                Start practicing <span>↗</span>
              </Link>
              <a href="#sample">Try a question ↓</a>
            </div>
          </div>
          <a
            className="book-stage"
            href="#sample"
            aria-label="Open the practice book to a sample question"
          >
            <div className="book">
              <div className="cover-top">
                <span>ScholarSAT</span>
                <span>Digital edition</span>
              </div>
              <strong>SAT</strong>
              <div className="contours" aria-hidden="true">
                {Array.from({ length: 24 }, (_, i) => (
                  <i
                    key={i}
                    style={{ width: 110 + i * 11, height: 115 + i * 9 }}
                  />
                ))}
              </div>
              <div className="cover-foot">
                <b>Practice Book</b>
                <span>
                  Math
                  <br />
                  Reading &amp; Writing
                </span>
              </div>
            </div>
            <span className="book-caption">
              Open sample <b>↗</b>
            </span>
          </a>
        </section>
        <section className="contents" id="contents">
          <div>
            <p className="imprint">In this edition</p>
            <h2>Contents</h2>
          </div>
          <div>
            {entries.map(([href, title, desc, count], i) => (
              <Link href={href} key={href}>
                <small>0{i + 1}</small>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <span>{count}</span>
                <b>↗</b>
              </Link>
            ))}
          </div>
        </section>
        <section className="sample" id="sample">
          <div>
            <p className="imprint">From the question bank</p>
            <h2>
              Work one
              <br />
              through.
            </h2>
            <p>
              Choose an answer to see the reasoning. You can try all three
              questions here.
            </p>
          </div>
          <LandingQuestion items={sampleItems()} />
        </section>
        <section className="contents questions">
          <div>
            <p className="imprint">Before you start</p>
            <h2>Field notes</h2>
          </div>
          <div>
            <details>
              <summary>Do I need an account?</summary>
              <p>
                Explore the question bank and vocabulary as a guest. Sign up to
                save progress and take full-length tests.
              </p>
            </details>
            <details>
              <summary>What does it cost?</summary>
              <p>
                The practice bank, vocabulary, tests and worked explanations are
                free. The optional AI tutor uses your own ChatGPT plan or OpenAI
                API billing.
              </p>
            </details>
            <details>
              <summary>Are the questions official?</summary>
              <p>
                CodeStarters builds original practice material. ScholarSAT is
                independent of College Board. Find official Bluebook practice in
                the <Link href="/resources">resource library</Link>.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer>
        <Logo size={32} />
        <div>
          <a href={CODESTARTERS}>CodeStarters</a>
          <a href={REPO}>GitHub</a>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
