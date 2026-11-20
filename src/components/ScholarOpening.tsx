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
    function keyframes() {
      const view = layer.getBoundingClientRect(), end = target.getBoundingClientRect();
      const zoom = view.width / layer.offsetWidth;
      const x = (end.left-view.left)/zoom - (layer.offsetWidth-word.offsetWidth)/2;
      const y = (end.top-view.top)/zoom - (layer.offsetHeight-word.offsetHeight)/2;
      const scale = parseFloat(getComputedStyle(target).fontSize) / parseFloat(getComputedStyle(word).fontSize);
      return [
        {transform:"none", offset:0}, {transform:"none", offset:.68, easing:"cubic-bezier(.45,0,.15,1)"},
        {transform:`translate(${x}px,${y}px) scale(${scale})`, offset:1}
      ];
    }
    const flight = word.animate(keyframes(), {duration:2100, fill:"both"});
    document.fonts.ready.then(() => {
      if (!layer.hidden && flight.effect instanceof KeyframeEffect) flight.effect.setKeyframes(keyframes());
    });
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
