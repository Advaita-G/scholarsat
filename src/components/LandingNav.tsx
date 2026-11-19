import Link from "next/link";
import { Owl } from "./Owl";

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="lunar-nav measure">
      <Link href="/" className="masthead" aria-label="ScholarSAT home"><Owl size={32} mood="still" />ScholarSAT</Link>
      <nav aria-label="Main navigation"><Link href="/practice">Question bank</Link><a href="#tests">Mock tests</a><a href="#tools">Study tools</a></nav>
      <div className="account-actions">{!signedIn && <Link href="/signup">Sign up</Link>}
      <Link className="account-link" href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "Dashboard" : "Log in"} <span aria-hidden="true">↗</span></Link></div>
    </header>
  );
}
