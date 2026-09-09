/**
 * SDUI "LocationSection" — current GPS location + server-provided quick
 * picks + entry point to global place search. Selecting a location
 * dispatches a local state update; TanStack Query refetches the SDUI
 * homepage for the new location automatically.
 */
import { Check, ChevronRight, LocateFixed, MapPin, Search } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { presetById } from "../../lib/presets";
import type { LocationSectionProps } from "../../types/sdui";

export function LocationSection(props: LocationSectionProps) {
  const activeId = useAppStore((s) => s.location.id);
  const setLocation = useAppStore((s) => s.setLocation);
  const openSearch = useAppStore((s) => s.setLocationSheetOpen);
  const saved = Array.isArray(props.saved) ? props.saved : [];

  return (
    <div className="glass rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{props.title}</h2>
        {props.gpsEnabled && (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            GPS on
          </span>
        )}
      </div>

      {/* global search entry */}
      <button
        type="button"
        onClick={() => openSearch(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-3.5 text-left transition hover:bg-white/[0.06] active:scale-[0.98]"
      >
        <Search className="h-4 w-4 shrink-0 text-white/55" strokeWidth={2.2} />
        <span className="flex-1 text-[13px] font-medium text-white/55">Search any city, town or village…</span>
        <ChevronRight className="h-4 w-4 text-white/30" strokeWidth={2.2} />
      </button>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07]">
          <LocateFixed className="h-4.5 w-4.5 text-white/80" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold">
            {props.current.city}
            {props.current.state ? `, ${props.current.state}` : ""}
          </div>
          <div className="tnum text-[11px] text-white/40">{props.current.label}</div>
        </div>
        <span className="shrink-0 rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold text-white/55">Current</span>
      </div>

      <p className="mb-2 mt-4 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Quick picks</p>
      <div className="grid grid-cols-1 gap-2">
        {saved.map((l) => {
          const isActive = l.id === activeId;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                const meta = presetById(l.id);
                if (meta) setLocation(meta);
              }}
              aria-pressed={isActive}
              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition active:scale-[0.98] ${
                isActive
                  ? "border-white/20 bg-white/[0.10]"
                  : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <MapPin className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-white/40"}`} strokeWidth={2.2} />
              <span className="flex-1 truncate text-[13px] font-medium">
                {l.city}
                <span className="ml-1.5 text-[11px] font-normal text-white/40">{l.state}</span>
              </span>
              {isActive && <Check className="h-4 w-4 text-emerald-300" strokeWidth={2.6} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
