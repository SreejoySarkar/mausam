/**
 * SDUI "WeatherHero" — current conditions. 100% server-driven content.
 */
import { ArrowDown, ArrowUp, MapPin } from "lucide-react";
import { resolveIcon } from "../../lib/icons";
import { useAppStore } from "../../store/useAppStore";
import { ATMOSPHERE } from "../../lib/theme";
import type { HeroProps } from "../../types/sdui";

export function WeatherHero(props: HeroProps) {
  const Icon = resolveIcon(props.icon);
  const themeId = useAppStore((s) => s.theme);
  const atmo = ATMOSPHERE[themeId];

  return (
    <div className="relative overflow-hidden rounded-[32px] glass px-6 pb-6 pt-7">
      {/* ambient glow behind the icon */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${atmo.glow}, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-white/60">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span className="truncate text-[12.5px] font-medium tracking-wide">{props.locationLabel}</span>
          </div>
          <div className="mt-3 flex items-start">
            <span className="tnum font-display text-[96px] font-semibold leading-[0.9] tracking-tighter text-white">
              {Math.round(props.temperature)}
            </span>
            <span className="mt-2 font-display text-[34px] font-medium" style={{ color: atmo.accent }}>
              °
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[12px] font-semibold"
              style={{ background: atmo.accentSoft, color: atmo.accent, borderColor: `${atmo.accent}33` }}
            >
              {props.condition}
            </span>
            <span className="text-[12.5px] text-white/55">Feels like {Math.round(props.feelsLike)}°</span>
          </div>
        </div>

        <div className="floaty flex flex-col items-center pt-2">
          <div
            className="flex h-[86px] w-[86px] items-center justify-center rounded-[28px] border border-white/10"
            style={{
              background: `linear-gradient(150deg, ${atmo.accentSoft}, rgba(255,255,255,0.03))`,
              boxShadow: `0 18px 40px -18px ${atmo.glow}`,
            }}
          >
            <Icon className="h-11 w-11" strokeWidth={1.6} style={{ color: atmo.accent }} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[12px] font-medium text-white/60">
            <span className="flex items-center gap-0.5">
              <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
              {Math.round(props.hi)}°
            </span>
            <span className="text-white/25">/</span>
            <span className="flex items-center gap-0.5">
              <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
              {Math.round(props.lo)}°
            </span>
          </div>
        </div>
      </div>

      <p className="relative mt-4 text-[13.5px] leading-relaxed text-white/70">{props.summary}</p>

      <div className="relative mt-5 grid grid-cols-3 gap-2.5">
        {(props.stats ?? []).slice(0, 3).map((s) => {
          const StatIcon = resolveIcon(s.icon);
          return (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.045] px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-white/45">
                <StatIcon className="h-3.5 w-3.5" strokeWidth={2} />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em]">{s.label}</span>
              </div>
              <div className="tnum mt-1 font-display text-[15px] font-semibold text-white/90">{s.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
