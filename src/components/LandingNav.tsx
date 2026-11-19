import Link from "next/link";
import { Logo } from "./Logo";

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="folio-header">
      <div className="prep-width folio-nav">
        <Logo size={31} light mood="still" />
        <nav aria-label="Site">
          <a href="#bank">Question bank</a>
          <a href="#tests">Mock tests</a>
          <a href="#tools">Study tools</a>
        </nav>
        {signedIn ? (
          <Link className="folio-account" href="/dashboard">Dashboard <span aria-hidden="true">↗</span></Link>
        ) : (
          <div className="folio-auth">
            <Link href="/login">Log in</Link>
            <Link className="folio-account" href="/signup">Sign up <span aria-hidden="true">↗</span></Link>
          </div>
        )}
      </div>
    </header>
  );
}
