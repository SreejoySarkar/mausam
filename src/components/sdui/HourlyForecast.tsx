/**
 * SDUI "HourlyForecast" — horizontally scrollable 12-hour strip.
 */
import { resolveIcon } from "../../lib/icons";
import { useAppStore } from "../../store/useAppStore";
import { ATMOSPHERE } from "../../lib/theme";
import type { HourlyProps } from "../../types/sdui";

export function HourlyForecast(props: HourlyProps) {
  const atmo = ATMOSPHERE[useAppStore((s) => s.theme)];
  const hours = Array.isArray(props.hours) ? props.hours : [];

  return (
    <div className="glass rounded-[28px] py-5">
      <div className="mb-4 flex items-center justify-between px-5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{props.title}</h2>
        <span className="text-[11px] text-white/30">next 12 hrs</span>
      </div>
      <div className="scrollbar-hide flex gap-2 overflow-x-auto px-5 pb-1" role="list">
        {hours.map((h, i) => {
          const Icon = resolveIcon(h.icon);
          const isNow = i === 0 || h.t === "Now";
          return (
            <div
              key={`${h.t}-${i}`}
              role="listitem"
              className={`flex w-[64px] shrink-0 flex-col items-center rounded-2xl border px-1 py-3 ${
                isNow ? "border-white/20 bg-white/[0.09]" : "border-white/[0.05] bg-white/[0.03]"
              }`}
            >
              <span
                className={`text-[11px] font-semibold ${isNow ? "" : "text-white/45"}`}
                style={isNow ? { color: atmo.accent } : undefined}
              >
                {h.t}
              </span>
              <Icon className="my-2.5 h-[22px] w-[22px] text-white/85" strokeWidth={1.8} />
              <span className="tnum font-display text-[15px] font-semibold">{Math.round(h.temp)}°</span>
              <span
                className={`mt-1.5 flex items-center gap-0.5 text-[10px] font-semibold ${
                  h.precip >= 30 ? "text-sky-300" : "text-white/25"
                }`}
              >
                <span className={`inline-block h-1 w-1 rounded-full ${h.precip >= 30 ? "bg-sky-300" : "bg-white/20"}`} />
                {h.precip}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
