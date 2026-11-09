"use client";

import { useEffect, useRef } from "react";

// Ported from taste-skill's word-highlight moment: words ink one by one as the statement crosses the screen, and run back on the way up.
export function InkStatement({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>(".wh-word"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { words.forEach((w) => w.classList.add("is-on")); return; }
    let lit = -1;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.4;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, start - end + rect.height)));
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const next = atBottom ? words.length : Math.round(progress * words.length);
      if (next === lit) return;
      lit = next;
      words.forEach((w, i) => w.classList.toggle("is-on", i < next));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [text]);

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => <span key={i}><span className="wh-word">{word}</span>{i < words.length - 1 ? " " : ""}</span>)}
    </p>
  );
}
