/**
 * SDUI "DailyForecast" — 7-day list with temperature range bars.
 */
import { Droplets } from "lucide-react";
import { resolveIcon } from "../../lib/icons";
import { useAppStore } from "../../store/useAppStore";
import { ATMOSPHERE } from "../../lib/theme";
import type { DailyProps } from "../../types/sdui";

export function DailyForecast(props: DailyProps) {
  const atmo = ATMOSPHERE[useAppStore((s) => s.theme)];
  const days = Array.isArray(props.days) ? props.days : [];
  const weekLo = Math.min(...days.map((d) => d.lo));
  const weekHi = Math.max(...days.map((d) => d.hi));
  const span = Math.max(1, weekHi - weekLo);

  return (
    <div className="glass rounded-[28px] p-5">
      <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{props.title}</h2>
      <ul>
        {days.map((d, i) => {
          const Icon = resolveIcon(d.icon);
          const left = ((d.lo - weekLo) / span) * 100;
          const width = Math.max(8, ((d.hi - d.lo) / span) * 100);
          return (
            <li
              key={`${d.d}-${i}`}
              className={`flex items-center gap-3 py-2.5 ${i < days.length - 1 ? "border-b border-white/[0.05]" : ""}`}
            >
              <span className={`w-[52px] text-[13px] font-semibold ${i === 0 ? "" : "text-white/70"}`}>{d.d}</span>
              <span className={`flex w-9 items-center gap-1 ${d.precip >= 30 ? "text-sky-300" : "text-white/25"}`}>
                <Droplets className="h-3 w-3" strokeWidth={2.4} />
                <span className="tnum text-[10.5px] font-semibold">{d.precip}</span>
              </span>
              <Icon className="h-[19px] w-[19px] shrink-0 text-white/80" strokeWidth={1.8} />
              <span className="tnum ml-auto w-7 text-right text-[13px] font-medium text-white/45">{Math.round(d.lo)}°</span>
              <div className="relative h-[5px] w-[92px] shrink-0 overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute h-full rounded-full"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${atmo.accent}88, ${atmo.accent})`,
                  }}
                />
              </div>
              <span className="tnum w-7 text-right text-[13px] font-semibold">{Math.round(d.hi)}°</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
