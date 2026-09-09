/**
 * SDUI "MetricsGrid" — detail tiles with SVG gauges driven by backend props.
 */
import { resolveIcon } from "../../lib/icons";
import { parseClockMinutes } from "../../lib/format";
import type { Gauge, MetricItem, MetricsProps } from "../../types/sdui";

/* ------------------------------ gauges ------------------------------ */

function RingGauge({ pct, tint }: { pct: number; tint: string }) {
  const clamped = Math.min(1, Math.max(0, pct));
  const R = 20;
  const C = 2 * Math.PI * R;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={`${Math.round(clamped * 100)} percent`}>
      <circle cx="26" cy="26" r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="5" />
      <circle
        cx="26"
        cy="26"
        r={R}
        fill="none"
        stroke={tint}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - clamped)}
        transform="rotate(-90 26 26)"
      />
    </svg>
  );
}

function UVGauge({ value, max }: { value: number; max: number }) {
  const clamped = Math.min(Math.max(value, 0), max);
  const frac = clamped / max;
  // semicircular arc from 180° -> 0°
  const R = 22;
  const cx = 30;
  const cy = 30;
  const start = Math.PI;
  const end = Math.PI * (1 - frac);
  const x1 = cx + R * Math.cos(start);
  const y1 = cy - R * Math.sin(start);
  const x2 = cx + R * Math.cos(end);
  const y2 = cy - R * Math.sin(end);
  const large = frac > 0.5 ? 1 : 0;
  const dotX = x2;
  const dotY = y2;
  const color = value <= 2 ? "#34d399" : value <= 5 ? "#fbbf24" : value <= 7 ? "#fb923c" : value <= 10 ? "#f87171" : "#c084fc";
  return (
    <svg width="60" height="36" viewBox="0 0 60 36" role="img" aria-label={`UV index ${value} of ${max}`}>
      <path d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="5" strokeLinecap="round" />
      {frac > 0.01 && (
        <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      )}
      <circle cx={dotX} cy={dotY} r="4" fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function CompassGauge({ deg }: { deg: number }) {
  const c = 26;
  const r = 21;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={`Wind direction ${deg} degrees`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <text x={c} y={9} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="700">N</text>
      <g transform={`rotate(${deg} ${c} ${c})`}>
        <polygon points={`${c},${c - r + 6} ${c - 3.5},${c + 2} ${c + 3.5},${c + 2}`} fill="#38bdf8" />
      </g>
      <circle cx={c} cy={c} r={2.5} fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}

function SunpathGauge({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const sr = parseClockMinutes(sunrise);
  const ss = parseClockMinutes(sunset);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const frac = Math.min(1, Math.max(0, (nowMin - sr) / Math.max(1, ss - sr)));
  const R = 26;
  const cx = 34;
  const cy = 34;
  const angle = Math.PI * (1 - frac);
  const sunX = cx + R * Math.cos(angle);
  const sunY = cy - R * Math.sin(angle);
  const isDay = nowMin >= sr && nowMin <= ss;
  return (
    <svg width="68" height="40" viewBox="0 0 68 40" role="img" aria-label="Sun path">
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" strokeDasharray="3 4" />
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 ${frac > 0.5 ? 1 : 0} 1 ${sunX} ${sunY}`}
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="2" y1={cy} x2="66" y2={cy} stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
      {isDay && (
        <>
          <circle cx={sunX} cy={sunY} r="6" fill="#fbbf24" opacity="0.25" />
          <circle cx={sunX} cy={sunY} r="3.5" fill="#fde68a" />
        </>
      )}
    </svg>
  );
}

function GaugeView({ gauge }: { gauge?: Gauge }) {
  if (!gauge) return null;
  switch (gauge.kind) {
    case "ring":
      return <RingGauge pct={gauge.pct} tint={gauge.tint} />;
    case "uv":
      return <UVGauge value={gauge.value} max={gauge.max} />;
    case "compass":
      return <CompassGauge deg={gauge.deg} />;
    case "sunpath":
      return <SunpathGauge sunrise={gauge.sunrise} sunset={gauge.sunset} />;
    default:
      return null;
  }
}

/* ------------------------------- grid ------------------------------- */

function MetricTile({ m }: { m: MetricItem }) {
  const Icon = resolveIcon(m.icon);
  // tiles without a compact gauge take a full row so the grid never has gaps
  const wide = m.gauge?.kind === "sunpath" || !m.gauge;
  return (
    <div
      className={`glass flex items-center justify-between gap-2 rounded-[24px] p-4 ${wide ? "col-span-2" : ""}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-white/45">
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.1em]">{m.label}</span>
        </div>
        <div className="tnum mt-1.5 font-display text-[19px] font-semibold leading-none">
          {m.value}
          {m.unit && <span className="ml-1 text-[11.5px] font-medium text-white/45">{m.unit}</span>}
        </div>
        {m.sub && <div className="mt-1 truncate text-[10.5px] text-white/40">{m.sub}</div>}
      </div>
      <div className="shrink-0">
        <GaugeView gauge={m.gauge} />
      </div>
    </div>
  );
}

export function MetricsGrid(props: MetricsProps) {
  const metrics = Array.isArray(props.metrics) ? props.metrics : [];
  return (
    <div>
      <h2 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{props.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <MetricTile key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}
