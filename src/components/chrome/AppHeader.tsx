/**
 * App header — Mausam wordmark, location context, sync indicator,
 * notifications, and the persona pill that opens the selector sheet.
 */
import { Bell, ChevronDown, CloudSun, MapPin, RefreshCw } from "lucide-react";
import { resolveIcon } from "../../lib/icons";
import { personaMeta } from "../../store/personas";
import { useAppStore } from "../../store/useAppStore";
import { ATMOSPHERE } from "../../lib/theme";

export function AppHeader({ locationLabel, syncing, onRetry }: { locationLabel: string; syncing: boolean; onRetry: () => void }) {
  const persona = useAppStore((s) => s.persona);
  const theme = useAppStore((s) => s.theme);
  const setSheetOpen = useAppStore((s) => s.setSheetOpen);
  const setLocationSheetOpen = useAppStore((s) => s.setLocationSheetOpen);
  const meta = personaMeta(persona);
  const PersonaIcon = resolveIcon(meta.icon);
  const atmo = ATMOSPHERE[theme];

  return (
    <header className="relative z-30 px-5 pb-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15"
            style={{ background: `linear-gradient(140deg, ${atmo.accentSoft}, rgba(255,255,255,0.04))` }}
          >
            <CloudSun className="h-[19px] w-[19px]" strokeWidth={2} style={{ color: atmo.accent }} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[17px] font-bold tracking-tight">Mausam</div>
            <div className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/35">Personal Weather</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            aria-label="Refresh weather"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] backdrop-blur transition active:scale-90"
          >
            <RefreshCw className={`h-4 w-4 text-white/75 ${syncing ? "spin-slow" : ""}`} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] backdrop-blur transition active:scale-90"
          >
            <Bell className="h-4 w-4 text-white/75" strokeWidth={2.2} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setLocationSheetOpen(true)}
          aria-haspopup="dialog"
          aria-label="Change location"
          className="group min-w-0 rounded-xl py-0.5 pr-1 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            <MapPin className="h-3 w-3" strokeWidth={2.4} />
            Now showing
          </div>
          <div className="flex items-center gap-1.5">
            <span className="truncate font-display text-[13.5px] font-semibold text-white/85 group-hover:text-white">
              {locationLabel}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/40" strokeWidth={2.5} />
          </div>
        </button>

        {/* Persona pill */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] py-1.5 pl-1.5 pr-3 backdrop-blur-xl transition hover:bg-white/[0.12] active:scale-95"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: `${meta.accent}26`, color: meta.accent }}
          >
            <PersonaIcon className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="text-[12.5px] font-semibold">{meta.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-white/50" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
