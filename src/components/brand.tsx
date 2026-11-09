import type { ReactNode } from "react";

// Logo placeholder: an arch with the 8-point khatam star. Replaced visually once the school supplies its own logo.
export function BrandMark({ className = "size-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M4 44V22C4 11 13 4 24 4s20 7 20 18v22z" fill="#2498dc" />
      <path d="M24 13l3.5 8.5L36 25l-8.5 3.5L24 37l-3.5-8.5L12 25l8.5-3.5z" fill="#ffc94a" />
      <rect x="17" y="18" width="14" height="14" transform="rotate(45 24 25)" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="24" cy="25" r="2.4" fill="#fff" />
    </svg>
  );
}

export function Star({ className = "size-4", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 1l2.3 6.7L19 10l-6.7 2.3L10 19l-2.3-6.7L1 10l6.7-2.3z" fill={color} />
    </svg>
  );
}

export function SectionHeading({ kicker, title, intro, action, as = "h2" }: { kicker?: string; title: ReactNode; intro?: ReactNode; action?: ReactNode; as?: "h1" | "h2" }) {
  const Tag = as;
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div className="max-w-2xl">
        {kicker && <p className="kicker">{kicker}</p>}
        <Tag className={`${kicker ? "mt-2" : ""} font-heading font-extrabold leading-tight ${as === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-[2.1rem]"}`}>{title}</Tag>
        {intro && <p className="mt-3 text-[1.05rem] text-ink-soft">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageIntro({ kicker, title, intro, tone = "sky" }: { kicker: string; title: ReactNode; intro?: ReactNode; tone?: "sky" | "leaf" | "sun" | "clay" }) {
  const band = { sky: "bg-sky-50", leaf: "bg-leaf-50", sun: "bg-sun-50", clay: "bg-clay-50" }[tone];
  return (
    <section className={`${band} border-b border-line`}>
      <div className="wrap py-12 sm:py-16">
        <SectionHeading as="h1" kicker={kicker} title={title} intro={intro} />
      </div>
    </section>
  );
}

// Shown publicly when the school has not entered a piece of information yet.
export function Pending({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2 rounded-xl border border-dashed border-line bg-white px-4 py-3 text-sm text-ink-soft"><Star className="mt-1 size-3 shrink-0" color="#8193a6" />{children}</p>;
}
