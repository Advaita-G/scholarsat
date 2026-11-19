"use client";

import { useEffect, useRef } from "react";

export function TypeSculpture() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let closed = false;
    let dispose: (() => void) | undefined;
    import("./type-scene").then(({ mountType }) => {
      if (!closed) dispose = mountType(el);
    }).catch(() => { /* The styled wordmark remains visible without WebGL. */ });
    return () => { closed = true; dispose?.(); };
  }, []);
  return (
    <div ref={host} className="type-sculpture" aria-hidden="true">
      <div className="metal-fallback">SAT</div>
    </div>
  );
}
