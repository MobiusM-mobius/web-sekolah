"use client";

import { useEffect, useRef, useState } from "react";

export type MotionSection = { id: string; label: string };

const burstTones = ["var(--color-sun-400)", "var(--color-sky-500)", "var(--color-leaf-500)", "var(--color-clay-400)"];
const starPath = "M50 0 61 26 85 15 74 39 100 50 74 61 85 85 61 74 50 100 39 74 15 85 26 61 0 50 26 39 15 15 39 26Z";

// Homepage-only motion layer: scroll reveals, section dots, pointer tilt/parallax, click ripples and star bursts.
// Everything is progressive: without JS or with reduced motion the page renders fully static.
export function HomeMotion({ sections }: { sections: MotionSection[] }) {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    // Active section for the dot rail.
    const sectionEls = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sectionEls.forEach((el) => spy.observe(el));
    cleanups.push(() => spy.disconnect());

    // Scroll progress.
    let frame = 0;
    const paint = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("--p", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(frame); });

    if (reduced) return () => cleanups.forEach((fn) => fn());

    // Reveal on scroll; content is only hidden once this class exists.
    root.classList.add("motion-on");
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); reveal.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    cleanups.push(() => { reveal.disconnect(); root.classList.remove("motion-on"); });

    if (finePointer) {
      const onMove = (ev: PointerEvent) => {
        const target = ev.target as Element | null;
        const tilt = target?.closest<HTMLElement>("[data-tilt]");
        if (tilt) {
          const r = tilt.getBoundingClientRect();
          const x = (ev.clientX - r.left) / r.width;
          const y = (ev.clientY - r.top) / r.height;
          tilt.style.setProperty("--mx", `${x * 100}%`);
          tilt.style.setProperty("--my", `${y * 100}%`);
          tilt.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
          tilt.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
        }
        const scene = target?.closest<HTMLElement>("[data-scene]");
        const layer = scene?.querySelector<HTMLElement>("[data-parallax]");
        if (scene && layer) {
          const r = scene.getBoundingClientRect();
          layer.style.setProperty("--px", ((ev.clientX - r.left) / r.width - 0.5).toFixed(3));
          layer.style.setProperty("--py", ((ev.clientY - r.top) / r.height - 0.5).toFixed(3));
        }
      };
      const onOut = (ev: PointerEvent) => {
        const from = (ev.target as Element | null)?.closest<HTMLElement>("[data-tilt]");
        if (from && !from.contains(ev.relatedTarget as Node | null)) {
          ["--rx", "--ry"].forEach((p) => from.style.setProperty(p, "0deg"));
        }
        const scene = (ev.target as Element | null)?.closest<HTMLElement>("[data-scene]");
        if (scene && !scene.contains(ev.relatedTarget as Node | null)) {
          const layer = scene.querySelector<HTMLElement>("[data-parallax]");
          layer?.style.setProperty("--px", "0");
          layer?.style.setProperty("--py", "0");
        }
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onOut, { passive: true });
      cleanups.push(() => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerout", onOut); });
    }

    const onDown = (ev: PointerEvent) => {
      const target = ev.target as Element | null;
      const surface = target?.closest<HTMLElement>("main .btn, main .card-link, [data-ripple]");
      if (surface) {
        const r = surface.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2.2;
        const dot = document.createElement("span");
        dot.className = "ripple";
        dot.style.cssText = `width:${size}px;height:${size}px;left:${ev.clientX - r.left - size / 2}px;top:${ev.clientY - r.top - size / 2}px`;
        surface.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove());
      }
      const burstHost = target?.closest<HTMLElement>("[data-burst], [data-parallax] .tile");
      if (burstHost) {
        burstHost.classList.remove("is-popped");
        void burstHost.offsetWidth;
        burstHost.classList.add("is-popped");
        for (let i = 0; i < 9; i++) {
          const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          star.setAttribute("viewBox", "0 0 100 100");
          star.setAttribute("aria-hidden", "true");
          star.classList.add("burst-star");
          const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 46 + Math.random() * 56;
          star.style.cssText = `left:${ev.clientX}px;top:${ev.clientY}px;--bx:${Math.cos(angle) * dist}px;--by:${Math.sin(angle) * dist}px;--bs:${0.6 + Math.random() * 0.7};--br:${Math.round(Math.random() * 240 - 120)}deg;color:${burstTones[i % burstTones.length]}`;
          star.innerHTML = `<path d="${starPath}" fill="currentColor"/>`;
          document.body.appendChild(star);
          star.addEventListener("animationend", () => star.remove());
        }
      }
    };
    document.addEventListener("pointerdown", onDown);
    cleanups.push(() => document.removeEventListener("pointerdown", onDown));

    return () => cleanups.forEach((fn) => fn());
  }, [sections]);

  return <>
    <div ref={bar} className="scroll-meter" aria-hidden="true" />
    {sections.length > 1 && (
      <nav aria-label="Bagian halaman" className="section-rail no-print">
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined} className="section-dot">
                <span className="section-dot-label">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    )}
  </>;
}
