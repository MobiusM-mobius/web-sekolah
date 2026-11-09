import type { CSSProperties, ReactNode } from "react";

export type Tone = "sky" | "leaf" | "sun" | "clay" | "night" | "white" | "paper";
export type ShapeKind = "arch" | "quarter" | "circle" | "half" | "star" | "crescent" | "dots" | "ring" | "rainbow";

const fill: Record<Tone, string> = {
  sky: "var(--color-sky-500)", leaf: "var(--color-leaf-500)", sun: "var(--color-sun-400)", clay: "var(--color-clay-400)",
  night: "var(--color-night)", white: "#fff", paper: "var(--color-paper)",
};
const ground: Record<Tone, string> = {
  sky: "bg-sky-500", leaf: "bg-leaf-500", sun: "bg-sun-400", clay: "bg-clay-400", night: "bg-night", white: "bg-white", paper: "bg-paper",
};

// Geometric glyphs on a 100x100 grid: mihrab arch, khatam star, crescent, plus toy-block primitives.
export function Shape({ kind, tone = "white", className = "size-full", rotate = 0, style }: { kind: ShapeKind; tone?: Tone; className?: string; rotate?: number; style?: CSSProperties }) {
  const f = fill[tone];
  const t = rotate ? `rotate(${rotate} 50 50)` : undefined;
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true" focusable="false">
      <g transform={t} fill={f}>
        {kind === "arch" && <path d="M8 100V52a42 42 0 0 1 84 0v48z" />}
        {kind === "quarter" && <path d="M0 0h100v100A100 100 0 0 1 0 0z" />}
        {kind === "circle" && <circle cx="50" cy="50" r="42" />}
        {kind === "half" && <path d="M0 100a50 50 0 0 1 100 0z" />}
        {kind === "star" && <><rect x="21" y="21" width="58" height="58" /><rect x="21" y="21" width="58" height="58" transform="rotate(45 50 50)" /></>}
        {kind === "crescent" && <path d="M60 6A44 44 0 0 0 60 94A56 56 0 0 1 60 6z" />}
        {kind === "dots" && [20, 50, 80].flatMap((y) => [20, 50, 80].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="9" />))}
        {kind === "ring" && <circle cx="50" cy="50" r="34" fill="none" stroke={f} strokeWidth="16" />}
        {kind === "rainbow" && <>
          <path d="M0 100a50 50 0 0 1 100 0h-14a36 36 0 0 0-72 0z" fill="var(--color-clay-400)" />
          <path d="M14 100a36 36 0 0 1 72 0H72a22 22 0 0 0-44 0z" fill="var(--color-sun-400)" />
          <path d="M28 100a22 22 0 0 1 44 0H58a8 8 0 0 0-16 0z" fill="var(--color-leaf-500)" />
        </>}
      </g>
    </svg>
  );
}

export type Tile = { tone: Tone; shape?: ShapeKind; shapeTone?: Tone; rotate?: number; span?: string; round?: string; content?: ReactNode };

// A grid of coloured blocks, each carrying one glyph: the site's signature "mosaik".
export function Mosaic({ tiles, cols, className = "", animate = false }: { tiles: Tile[]; cols: number; className?: string; animate?: boolean }) {
  return (
    <div className={`grid gap-2.5 sm:gap-3 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} aria-hidden="true">
      {tiles.map((tile, i) => (
        <div key={i} className={`tile relative overflow-hidden ${ground[tile.tone]} ${tile.span ?? "aspect-square"} ${tile.round ?? "rounded-[22%]"} ${animate ? "settle" : ""}`} style={animate ? ({ "--i": i } as CSSProperties) : undefined}>
          {tile.content ?? (tile.shape && <div className="tile-glyph absolute inset-[14%]"><Shape kind={tile.shape} tone={tile.shapeTone ?? "white"} rotate={tile.rotate} /></div>)}
        </div>
      ))}
    </div>
  );
}

export function BrandMark({ className = "size-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="var(--color-sky-500)" />
      <path d="M10 42V25a14 14 0 0 1 28 0v17z" fill="var(--color-night)" opacity=".22" />
      <path d="M24 11l3.2 7.8L35 22l-7.8 3.2L24 33l-3.2-7.8L13 22l7.8-3.2z" fill="var(--color-sun-400)" />
      <circle cx="24" cy="22" r="3" fill="#fff" />
      <rect x="10" y="38" width="28" height="4" rx="2" fill="#fff" />
    </svg>
  );
}

export function Star({ className = "size-4", tone = "sky" }: { className?: string; tone?: Tone }) {
  return <Shape kind="star" tone={tone} className={className} />;
}

export function SectionHeading({ kicker, title, intro, action, as = "h2", light = false }: { kicker?: string; title: ReactNode; intro?: ReactNode; action?: ReactNode; as?: "h1" | "h2"; light?: boolean }) {
  const Tag = as;
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <div className="max-w-3xl">
        {kicker && <p className={`kicker ${light ? "!text-sun-300" : ""}`}>{kicker}</p>}
        <Tag className={`${kicker ? "mt-3" : ""} display ${as === "h1" ? "display-lg" : "display-md"} ${light ? "text-white" : ""}`}>{title}</Tag>
        {intro && <p className={`mt-4 max-w-2xl text-[1.08rem] ${light ? "text-white/75" : "text-ink-soft"}`}>{intro}</p>}
      </div>
      {action}
    </div>
  );
}

const introTones: Record<"sky" | "leaf" | "sun" | "clay", { band: string; tiles: Tile[]; pill: string }> = {
  sky: { band: "bg-sky-50", pill: "var(--color-sun-400)", tiles: [{ tone: "sky", shape: "arch" }, { tone: "sun", shape: "star", shapeTone: "night" }, { tone: "leaf", shape: "crescent" }, { tone: "clay", shape: "quarter", rotate: 90 }] },
  leaf: { band: "bg-leaf-50", pill: "var(--color-leaf-300)", tiles: [{ tone: "leaf", shape: "half" }, { tone: "sky", shape: "dots" }, { tone: "sun", shape: "arch", shapeTone: "night" }, { tone: "night", shape: "star", shapeTone: "sun" }] },
  sun: { band: "bg-sun-50", pill: "var(--color-sun-400)", tiles: [{ tone: "sun", shape: "star", shapeTone: "white" }, { tone: "clay", shape: "circle" }, { tone: "night", shape: "crescent", shapeTone: "sun" }, { tone: "sky", shape: "arch" }] },
  clay: { band: "bg-clay-50", pill: "var(--color-clay-300)", tiles: [{ tone: "clay", shape: "arch" }, { tone: "leaf", shape: "quarter" }, { tone: "sky", shape: "ring" }, { tone: "sun", shape: "half", shapeTone: "night" }] },
};

export function PageIntro({ kicker, title, intro, tone = "sky", children }: { kicker: string; title: ReactNode; intro?: ReactNode; tone?: "sky" | "leaf" | "sun" | "clay"; children?: ReactNode }) {
  const t = introTones[tone];
  return (
    <section className={`${t.band} lattice-ink relative overflow-hidden`} style={{ "--pw": t.pill } as CSSProperties}>
      <div className="wrap grid items-center gap-10 pb-14 pt-32 sm:pb-20 sm:pt-36 md:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <p className="kicker rise-soft" style={{ "--i": 0 } as CSSProperties}>{kicker}</p>
          <h1 className="display display-lg mt-4"><span className="rise-mask"><span className="rise-line">{title}</span></span></h1>
          {intro && <p className="rise-soft mt-5 max-w-2xl text-[1.12rem] leading-8 text-ink-soft" style={{ "--i": 1 } as CSSProperties}>{intro}</p>}
          {children}
        </div>
        <Mosaic tiles={t.tiles} cols={2} animate className="hidden w-[220px] md:grid lg:w-[260px]" />
      </div>
    </section>
  );
}

// Fills its (relative) parent: colour ground, faint lattice, one glyph. Stands in where a photo is not uploaded yet.
export function Art({ tone = "sky", shape = "arch", ink = "white", inset = "28%", className = "" }: { tone?: Tone; shape?: ShapeKind; ink?: Tone; inset?: string; className?: string }) {
  return (
    <div className={`absolute inset-0 ${ground[tone]} ${tone === "white" || tone === "paper" ? "lattice-ink" : "lattice"} ${className}`} aria-hidden="true">
      <div className="absolute" style={{ inset }}><Shape kind={shape} tone={ink} /></div>
    </div>
  );
}

export const toneCycle: { tone: Tone; ink: Tone; shape: ShapeKind }[] = [
  { tone: "sky", ink: "white", shape: "arch" },
  { tone: "sun", ink: "night", shape: "star" },
  { tone: "leaf", ink: "white", shape: "crescent" },
  { tone: "clay", ink: "white", shape: "half" },
];

// Shown publicly when the school has not entered a piece of information yet.
export function Pending({ children }: { children: ReactNode }) {
  return <p className="flex items-start gap-2.5 rounded-2xl border border-dashed border-line bg-white/70 px-4 py-3 text-[.95rem] text-ink-soft"><Star className="mt-1 size-3.5 shrink-0" tone="sun" />{children}</p>;
}
