import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Owl } from "@/components/Owl";
import { LinkButton } from "@/components/ui";
import { IArrowR } from "@/components/icons";

/** Global 404. Rendered inside the root layout, so it stands alone (no app shell). */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-12">
      <div className="max-w-md text-center">
        <div className="mb-10 flex justify-center">
          <Logo size={34} />
        </div>
        <div className="flex justify-center">
          <Owl size={96} mood="sad" />
        </div>
        <p className="eyebrow mt-6 text-muted">Error 404</p>
        <h1 className="mt-1 text-[30px] leading-tight font-medium text-ink">This page flew away</h1>
        <p className="mt-2 text-[15px] text-muted">
          The link is broken or the page never existed. Let&rsquo;s get you back to studying.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/">Back to home</LinkButton>
          <Link href="/practice" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-ink">
            Practice questions <IArrowR className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
