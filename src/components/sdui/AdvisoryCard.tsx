/**
 * SDUI "Advisory" — the persona-personalized section.
 *
 * One renderer, fully server-driven content: the backend picks the accent,
 * metrics, chart type and advisory rows per persona (agri / commute / travel
 * / marine / worksite / lifestyle).
 */
import { resolveIcon } from "../../lib/icons";
import { ACCENTS } from "../../lib/theme";
import type { AdvisoryChart, AdvisoryProps } from "../../types/sdui";

const TONE_DOT: Record<string, string> = {
  info: "bg-sky-400",
  warn: "bg-amber-400",
  danger: "bg-red-400",
  good: "bg-emerald-400",
};

/* ------------------------------ charts ------------------------------ */

function RainBars({ slots }: Extract<AdvisoryChart, { kind: "rain-bars" }>) {
  const max = Math.max(1, ...slots.map((s) => s.mm));
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/40">Expected rainfall</span>
        <span className="text-[10.5px] text-white/30">mm / 3 hr</span>
      </div>
      <div className="flex items-end gap-[7px]" style={{ height: 64 }}>
        {slots.map((s, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="tnum text-[9.5px] font-semibold text-white/45">{s.mm > 0 ? s.mm : ""}</span>
            <div
              className={`w-full rounded-t-[5px] ${s.mm >= 10 ? "bg-sky-400" : s.mm > 0 ? "bg-sky-400/45" : "bg-white/10"}`}
              style={{ height: s.mm > 0 ? Math.max(6, (s.mm / max) * 34) : 3 }}
            />
            <span className="text-[8.5px] text-white/30">{s.t.replace(" ", "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WindCompass({ deg, speed, gusts }: Extract<AdvisoryChart, { kind: "wind-compass" }>) {
  const r = 44;
  const c = 52;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5">
      <svg width={104} height={104} viewBox="0 0 104 104" role="img" aria-label={`Wind from ${deg} degrees`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const long = i % 6 === 0;
          const r1 = long ? r - 7 : r - 4;
          return (
            <line
              key={i}
              x1={c + r1 * Math.sin(a)}
              y1={c - r1 * Math.cos(a)}
              x2={c + r * Math.sin(a)}
              y2={c - r * Math.cos(a)}
              stroke={long ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"}
              strokeWidth={long ? 1.6 : 1}
            />
          );
        })}
        <text x={c} y={14} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700">N</text>
        <text x={c} y={96} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="700">S</text>
        <text x={94} y={c + 3} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="700">E</text>
        <text x={10} y={c + 3} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="700">W</text>
        <g transform={`rotate(${deg} ${c} ${c})`}>
          <polygon points={`${c},${c - r + 14} ${c - 5.5},${c + 4} ${c + 5.5},${c + 4}`} fill="#22d3ee" opacity="0.95" />
          <polygon points={`${c},${c + r - 20} ${c - 5},${c + 4} ${c + 5},${c + 4}`} fill="rgba(255,255,255,0.25)" />
        </g>
        <circle cx={c} cy={c} r={15} fill="rgba(8,20,30,0.85)" stroke="rgba(255,255,255,0.14)" />
        <text x={c} y={c + 1} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Sora">
          {speed}
        </text>
        <text x={c} y={c + 11} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7">km/h</text>
      </svg>
      <div className="flex-1 space-y-2">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-white/45">Direction</span>
          <span className="tnum font-semibold">{deg}°</span>
        </div>
        <div className="h-px bg-white/[0.07]" />
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-white/45">Steady</span>
          <span className="tnum font-semibold">{speed} km/h</span>
        </div>
        <div className="h-px bg-white/[0.07]" />
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="text-white/45">Gusts</span>
          <span className="tnum font-semibold text-cyan-200">{gusts} km/h</span>
        </div>
      </div>
    </div>
  );
}

function HeatTimeline({ from, to, danger, peak }: Extract<AdvisoryChart, { kind: "heat-timeline" }>) {
  const span = to - from;
  const x1 = ((danger[0] - from) / span) * 100;
  const x2 = ((danger[1] - from) / span) * 100;
  const xp = ((peak - from) / span) * 100;
  const ticks = [from, from + span / 2, to];
  const lbl = (h: number) => {
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}${h >= 12 ? " PM" : " AM"}`;
  };
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/40">Heat stress timeline</span>
        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-red-300">
          Avoid {lbl(danger[0])}–{lbl(danger[1])}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-400/50 via-amber-400/60 to-emerald-400/50">
        <div
          className="absolute inset-y-0 rounded-full bg-red-500/70"
          style={{ left: `${x1}%`, width: `${x2 - x1}%` }}
        />
        <div
          className="absolute -top-[3px] h-[18px] w-[3px] rounded-full bg-white"
          style={{ left: `calc(${xp}% - 1px)` }}
        />
        <span className="absolute -top-5 -translate-x-1/2 text-[9px] font-semibold text-white/60" style={{ left: `${xp}%` }}>
          Peak
        </span>
      </div>
      <div className="mt-1.5 flex justify-between text-[9.5px] text-white/35">
        {ticks.map((t) => (
          <span key={t}>{lbl(t)}</span>
        ))}
      </div>
    </div>
  );
}

function Chart({ chart }: { chart?: AdvisoryChart }) {
  if (!chart) return null;
  switch (chart.kind) {
    case "rain-bars":
      return <RainBars {...chart} />;
    case "wind-compass":
      return <WindCompass {...chart} />;
    case "heat-timeline":
      return <HeatTimeline {...chart} />;
    default:
      return null;
  }
}

/* ------------------------------- card ------------------------------- */

export function AdvisoryCard(props: AdvisoryProps) {
  const HeaderIcon = resolveIcon(props.icon);
  const accent = ACCENTS[props.accent] ?? ACCENTS.sky;
  const metrics = Array.isArray(props.metrics) ? props.metrics.slice(0, 3) : [];
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <div className="glass overflow-hidden rounded-[28px]">
      <div className={`border-b px-5 pb-4 pt-5 ${accent.chip}`} style={{ borderBottomColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accent.chip}`}>
            <HeaderIcon className={`h-5 w-5 ${accent.icon}`} strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-semibold leading-tight">{props.title}</h2>
            <p className="text-[11.5px] text-white/45">{props.subtitle}</p>
          </div>
          <span className={`ml-auto rounded-full border px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] ${accent.chip} ${accent.text}`}>
            Personal
          </span>
        </div>
      </div>

      <div className="space-y-3.5 p-5">
        {metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                <div className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">{m.label}</div>
                <div className="tnum mt-1 truncate font-display text-[14.5px] font-semibold">{m.value}</div>
                {m.sub && <div className="mt-0.5 truncate text-[10px] text-white/40">{m.sub}</div>}
              </div>
            ))}
          </div>
        )}

        <Chart chart={props.chart} />

        <ul className="space-y-1">
          {items.map((item, i) => {
            const ItemIcon = resolveIcon(item.icon);
            return (
              <li key={`${item.title}-${i}`} className="flex items-start gap-3.5 rounded-2xl px-2 py-2.5 transition hover:bg-white/[0.03]">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05]">
                  <ItemIcon className="h-4 w-4 text-white/75" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-semibold">{item.title}</h4>
                    {item.tone && <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[item.tone] ?? "bg-sky-400"}`} />}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {props.footnote && <p className="pt-1 text-[10.5px] text-white/30">{props.footnote}</p>}
      </div>
    </div>
  );
}
