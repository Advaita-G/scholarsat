"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";
import { IArrowR } from "./icons";

export function StartTestButton({ label = "Start a new test", size = "lg", className = "", variant = "primary" }: { label?: string; size?: "sm" | "md" | "lg"; className?: string; variant?: "primary" | "secondary" | "dark" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/tests", { method: "POST" });
          const data = (await r.json().catch(() => ({}))) as { id?: number };
          if (data.id) router.push(`/tests/${data.id}`);
          else setBusy(false);
        } catch {
          setBusy(false);
        }
      }}
    >
      {busy ? "Preparing…" : <>{label} <IArrowR className="h-4 w-4" /></>}
    </Button>
  );
}
