import Link from "next/link";
import { questionBankSession } from "./landing-navigation";
import { Owl } from "./Owl";

export function LandingNav({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="lunar-nav measure">
      <Link href="/" className="masthead" aria-label="ScholarSAT home"><Owl size={32} mood="still" />ScholarSAT</Link>
      <nav aria-label="Main navigation"><Link href={questionBankSession}>Question bank</Link><Link href="/#tests">Mock tests</Link><Link href="/#tools">Study tools</Link></nav>
      <div className="account-actions">{!signedIn && <Link href="/signup">Sign up</Link>}
      <Link className="account-link" href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "Dashboard" : "Log in"} <span aria-hidden="true">↗</span></Link></div>
    </header>
  );
}
