import Link from "next/link";
import { getUser } from "@/lib/auth";
import { BY_ID, counts, QUESTIONS } from "@/lib/bank";
import { rich } from "@/lib/render";
import { DIFFICULTY_LABEL, type Question } from "@/lib/types";
import { MODULES } from "@/lib/tests";
import { lessons } from "@/data/context-lessons";
import { Logo } from "@/components/Logo";
import { type LandingItem } from "@/components/LandingQuestion";
import { LandingNav } from "@/components/LandingNav";
import { PracticeSetPicker } from "@/components/PracticeSetPicker";
import { TestTiming } from "@/components/TestTiming";
import { LandingStudio } from "@/components/LandingStudio";
import "@/components/landing.css";

export const dynamic = "force-dynamic";
const REPO = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/Codestarters-Foundation/scholarsat";
const CODESTARTERS = "https://codestarters.org";
const SAMPLES = [
  { id: "r9980c71a", label: "Grammar", title: "Which verb fits the sentence?", work: "grammar" },
  { id: "m7cf3173b", label: "Systems", title: "Solve the system.", work: "systems" },
  { id: "m30ee0293", label: "Percents", title: "What’s the final price?", work: "percentages" },
] as const;

function sentenceParts(text: string, clue: string): LandingItem["sentence"] {
  const [before, after] = text.split(/_{4,}/);
  const start = before.indexOf(clue);
  if (start < 0 || after === undefined) return undefined;
  return {
    before: before.slice(0, start),
    clue,
    between: before.slice(start + clue.length),
    after,
  };
}

function bankSample(q: Question, tab: Pick<LandingItem, "label" | "title" | "work">): LandingItem[] {
  if (q.type !== "mcq" || !q.choices || q.table || q.passage2) return [];
  const stem = tab.work === "systems"
    ? [...q.stem.split("<br>").slice(0, 2), "At the solution, what is \\(x + y\\)?"].join("<br>")
    : q.stem;
  const passage = tab.work === "grammar"
    ? q.passage?.replace(", donated by the author's family,", "").replace(" in the library's main hall", "")
    : q.passage;
  return [{
    id: q.id,
    ...tab,
    topic: q.section === "math" ? "Math" : "Reading and Writing",
    difficulty: DIFFICULTY_LABEL[q.difficulty],
    passageHtml: passage ? rich(passage, "htmlAndMathml") : undefined,
    sentence: tab.work === "grammar" && passage ? sentenceParts(passage, "collection") : undefined,
    stemHtml: rich(stem, "htmlAndMathml"),
    choices: q.choices.map((choice) => {
      const number = /^\\\(([-−]?\d+(?:\.\d+)?)\\\)$/.exec(choice)?.[1];
      const label = number?.replace(/^-/, "−") ?? choice;
      return { html: rich(label, "htmlAndMathml"), label };
    }),
    answer: q.answer,
    explanationHtml: tab.work === "systems"
      ? "The lines intersect at (3, −1). That point satisfies both equations, so x + y = 3 − 1 = 2."
      : rich(q.explanation, "htmlAndMathml"),
  }];
}

function sampleItems(): LandingItem[] {
  const picked = SAMPLES.flatMap(({ id, ...tab }) => {
    const q = BY_ID.get(id);
    return q ? bankSample(q, tab) : [];
  });
  const pool = picked.length ? picked : QUESTIONS
    .filter((q) => q.difficulty === "M" && q.type === "mcq" && q.choices && !q.table && !q.passage2)
    .slice(0, 3)
    .flatMap((q, index) => bankSample(q, { label: "Question " + (index + 1), title: q.skill }));
  const lesson = lessons[0];
  return [...pool, {
    id: "context-vocabulary",
    label: "Vocabulary",
    title: "Which word fits the context?",
    topic: "Words in context",
    stemHtml: rich(lesson.passage),
    sentence: sentenceParts(lesson.passage, "will be redrawn"),
    choices: lesson.choices.map((word) => ({ html: rich(word), label: word })),
    answer: "ABC"[lesson.choices.indexOf(lesson.word)],
    explanationHtml: rich(lesson.why),
    work: "vocabulary",
  }];
}

export default async function Landing() {
  const user = await getUser();
  const bank = counts();
  return (
    <div className="scholar-home">
      <a className="folio-skip" href="#main">Skip to content</a>
      <LandingNav signedIn={!!user} />
      <main id="main">
        <LandingStudio items={sampleItems()} />

        <section className="prep-width bank-section" id="bank" aria-labelledby="bank-title">
          <div className="bank-copy">
            <div>
              <p className="folio-meta">Question bank</p>
              <h2 id="bank-title">Practice by skill.</h2>
            </div>
            <Link className="folio-link" href="/practice">
              Browse {bank.total.toLocaleString("en-US")} questions <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="bank-lede">Pick one skill and work through up to five questions.</p>
          <PracticeSetPicker counts={bank.bySkill} />
        </section>

        <div className="timing-band">
          <div className="prep-width">
            <TestTiming modules={MODULES} />
          </div>
        </div>

        <section className="prep-width tour-section" id="tools" aria-labelledby="tools-title">
          <div className="tour-copy">
            <p className="folio-meta">Study tools</p>
            <h2 id="tools-title">Learn from a miss.</h2>
            <p>Retry missed questions, track accuracy by skill, and use what you learn to choose what to practice next.</p>
            <Link className="folio-link" href={user ? "/dashboard" : "/signup"}>
              {user ? "Open dashboard" : "Create a free account"} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <nav className="study-index" aria-label="Study tools">
            <Link href="/review">Mistake review <span aria-hidden="true">↗</span></Link>
            <Link href="/diagnostics">Skill diagnostics <span aria-hidden="true">↗</span></Link>
            <Link href="/vocab">Vocabulary practice <span aria-hidden="true">↗</span></Link>
          </nav>
        </section>

        <aside className="prep-width access-note" id="faq" aria-labelledby="access-title">
          <h2 id="access-title">A note on access</h2>
          <div>
            <p>The question bank and <Link href="/vocab">vocabulary practice</Link> are free. An account unlocks full tests and saved progress. Optional AI explanations use your own plan or API billing.</p>
            <p>ScholarSAT is an independent CodeStarters project. Find official materials in the <Link href="/resources">SAT resource library</Link>.</p>
          </div>
        </aside>
      </main>

      <footer className="folio-footer">
        <div className="prep-width">
          <div className="footer-action">
            <p>Free SAT prep.</p>
            <Link className="folio-button" href="/practice">Start practicing <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="footer-links">
            <Logo size={28} light mood="still" />
            <nav aria-label="Footer">
              <a href={CODESTARTERS}>CodeStarters</a>
              <a href={REPO}>GitHub</a>
              <a href="#faq">Study access</a>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
