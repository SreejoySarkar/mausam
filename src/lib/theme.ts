import type { ThemeId } from "../types/sdui";

export interface Atmosphere {
  /** vertical sky gradient stops */
  sky: [string, string, string];
  /** soft glow orb colors */
  orbA: string;
  orbB: string;
  /** primary accent for highlights, gauges, chips */
  accent: string;
  accentSoft: string;
  /** hero icon glow */
  glow: string;
}

export const ATMOSPHERE: Record<ThemeId, Atmosphere> = {
  dusk: {
    sky: ["#181233", "#31204e", "#5b2f47"],
    orbA: "rgba(251, 146, 60, 0.34)",
    orbB: "rgba(129, 140, 248, 0.28)",
    accent: "#fbbf24",
    accentSoft: "rgba(251, 191, 36, 0.14)",
    glow: "rgba(251, 191, 36, 0.45)",
  },
  monsoon: {
    sky: ["#0a1522", "#12283b", "#1d3a4d"],
    orbA: "rgba(56, 189, 248, 0.26)",
    orbB: "rgba(45, 212, 191, 0.18)",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.14)",
    glow: "rgba(56, 189, 248, 0.4)",
  },
  heat: {
    sky: ["#1d0b14", "#3d1520", "#6e2820"],
    orbA: "rgba(248, 113, 113, 0.3)",
    orbB: "rgba(251, 146, 60, 0.3)",
    accent: "#fb923c",
    accentSoft: "rgba(251, 146, 60, 0.14)",
    glow: "rgba(251, 146, 60, 0.5)",
  },
  marine: {
    sky: ["#04141f", "#083048", "#0d4c63"],
    orbA: "rgba(34, 211, 238, 0.26)",
    orbB: "rgba(59, 130, 246, 0.22)",
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.13)",
    glow: "rgba(34, 211, 238, 0.42)",
  },
  cloud: {
    sky: ["#12141f", "#232a3d", "#37415a"],
    orbA: "rgba(148, 163, 184, 0.24)",
    orbB: "rgba(129, 140, 248, 0.22)",
    accent: "#a5b4fc",
    accentSoft: "rgba(165, 180, 252, 0.14)",
    glow: "rgba(165, 180, 252, 0.4)",
  },
};

export const DEFAULT_ATMOSPHERE = ATMOSPHERE.cloud;

/* Accent palettes used by advisory cards (full class strings for Tailwind). */
export const ACCENTS: Record<
  string,
  { chip: string; icon: string; text: string; dot: string }
> = {
  emerald: {
    chip: "bg-emerald-400/15 border-emerald-300/20",
    icon: "text-emerald-300",
    text: "text-emerald-200",
    dot: "bg-emerald-400",
  },
  sky: {
    chip: "bg-sky-400/15 border-sky-300/20",
    icon: "text-sky-300",
    text: "text-sky-200",
    dot: "bg-sky-400",
  },
  violet: {
    chip: "bg-violet-400/15 border-violet-300/20",
    icon: "text-violet-300",
    text: "text-violet-200",
    dot: "bg-violet-400",
  },
  cyan: {
    chip: "bg-cyan-400/15 border-cyan-300/20",
    icon: "text-cyan-300",
    text: "text-cyan-200",
    dot: "bg-cyan-400",
  },
  amber: {
    chip: "bg-amber-400/15 border-amber-300/20",
    icon: "text-amber-300",
    text: "text-amber-200",
    dot: "bg-amber-400",
  },
  rose: {
    chip: "bg-rose-400/15 border-rose-300/20",
    icon: "text-rose-300",
    text: "text-rose-200",
    dot: "bg-rose-400",
  },
  lime: {
    chip: "bg-lime-400/15 border-lime-300/20",
    icon: "text-lime-300",
    text: "text-lime-200",
    dot: "bg-lime-400",
  },
};
