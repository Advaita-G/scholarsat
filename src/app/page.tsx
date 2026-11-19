import Link from "next/link";
import { getUser } from "@/lib/auth";
import { BY_ID, counts } from "@/lib/bank";
import { MODULES } from "@/lib/tests";
import { LandingStudio } from "@/components/LandingStudio";
import { LandingNav } from "@/components/LandingNav";
import { StudyPath } from "@/components/StudyPath";
import { StudyDesk } from "@/components/StudyDesk";
import "@/components/landing.css";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const user = await getUser();
  const bank = counts();
  const question = BY_ID.get("ra970690e");
  if (!question?.passage || !question.choices) throw new Error("Featured transition question is missing");
  return (
    <div className="lunar-home">
      <Link className="lunar-skip" href="/#passage">Skip to practice</Link>
      <LandingNav signedIn={!!user} />
      <main className="practice-journey">
        <StudyPath />
        <LandingStudio question={{ passage: question.passage, stem: question.stem, choices: question.choices,
          answer: question.answer, explanation: question.explanation }} />
        <StudyDesk signedIn={!!user} modules={MODULES} counts={bank.bySkill} total={bank.total} />
      </main>
      <footer className="lunar-footer measure">
        <div><strong>ScholarSAT</strong><span>Free SAT practice by <a href="https://codestarters.org">CodeStarters</a>.</span></div>
        <div className="footer-fine"><details><summary>Access &amp; costs</summary><p>The question bank and vocabulary practice are free. A free account adds timed tests and saved progress. Optional AI explanations use your own plan or API billing.</p></details><nav aria-label="Footer"><Link href="/resources">SAT resources</Link><a href={process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/Codestarters-Foundation/scholarsat"}>GitHub</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></div>
      </footer>
    </div>
  );
}
