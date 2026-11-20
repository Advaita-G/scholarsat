"use client";

import { useLayoutEffect, useRef } from "react";

export function ScholarOpening() {
  const sheet = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const layer = sheet.current!;
    const target = document.querySelector<HTMLElement>(".cover-copy h1")!;
    const word = layer.querySelector<HTMLElement>(".opening-word")!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    if (location.hash || scrollY > 1 || preference.matches || document.documentElement.classList.contains("reduce-motion")) return;
    layer.hidden = false;
    const origin = word.getBoundingClientRect(), end = target.getBoundingClientRect();
    const zoom = layer.getBoundingClientRect().width / layer.offsetWidth;
    const scale = parseFloat(getComputedStyle(target).fontSize) / parseFloat(getComputedStyle(word).fontSize);
    const destination = `translate(${(end.left-origin.left)/zoom}px,${(end.top-origin.top)/zoom}px) scale(${scale})`;
    const flight = word.animate([
      {transform:"none", offset:0}, {transform:"none", offset:.42, easing:"cubic-bezier(.45,0,.15,1)"},
      {transform:destination, offset:1}
    ], {duration:1100,fill:"both"});
    target.style.opacity = "0";
    function finish() {
      layer.hidden = true;
      target.style.opacity = "";
      flight.cancel();
    }
    flight.onfinish = finish;
    const events = ["wheel","touchstart","pointerdown","keydown","scroll","resize"];
    events.forEach(name => window.addEventListener(name,finish,{passive:true,once:true}));
    preference.addEventListener("change",finish);
    return () => {
      events.forEach(name => window.removeEventListener(name,finish));
      preference.removeEventListener("change",finish);
      finish();
    };
  }, []);
  return <div ref={sheet} className="scholar-opening" hidden aria-hidden="true">
    <div className="opening-paper"/><div className="opening-word">ScholarSAT<span>ScholarSAT</span></div>
  </div>;
}
