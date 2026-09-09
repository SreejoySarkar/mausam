/**
 * Location search sheet — search ANY place on Earth.
 *
 *  - debounced geocoding search (TanStack Query)
 *  - GPS detect with reverse geocoding
 *  - recent searches persisted to MMKV
 *  - curated quick picks (instant, no network)
 *
 * Selecting a place updates Zustand + MMKV; the homepage query key changes
 * and TanStack Query fetches the SDUI payload for the new coordinates.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, ChevronRight, Clock, Globe2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { placeToLocation, reverseGeocode, searchPlaces } from "../../services/openMeteo";
import { PRESET_LOCATIONS } from "../../lib/presets";
import { useAppStore } from "../../store/useAppStore";
import type { LocationMeta } from "../../types/sdui";

function useDebounced<T>(value: T, delay: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export function LocationSheet() {
  const open = useAppStore((s) => s.locationSheetOpen);
  const setOpen = useAppStore((s) => s.setLocationSheetOpen);
  const activeId = useAppStore((s) => s.location.id);
  const setLocation = useAppStore((s) => s.setLocation);
  const recents = useAppStore((s) => s.recentLocations);
  const pushRecent = useAppStore((s) => s.pushRecentLocation);

  const [query, setQuery] = useState("");
  const [gpsState, setGpsState] = useState<"idle" | "locating" | "error">("idle");
  const debounced = useDebounced(query, 350);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = debounced.trim();

  const search = useQuery({
    queryKey: ["geo-search", trimmed],
    queryFn: ({ signal }) => searchPlaces(trimmed, signal),
    enabled: trimmed.length >= 2,
    staleTime: 10 * 60_000,
    gcTime: 15 * 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (open) {
      setQuery("");
      setGpsState("idle");
      const id = setTimeout(() => inputRef.current?.focus(), 420);
      return () => clearTimeout(id);
    }
  }, [open]);

  const pick = (loc: LocationMeta) => {
    setLocation(loc);
    pushRecent(loc);
    setOpen(false);
  };

  const useGPS = () => {
    if (!navigator.geolocation) {
      setGpsState("error");
      return;
    }
    setGpsState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const name = await reverseGeocode(latitude, longitude);
        const city = name ?? "Current location";
        pick({
          id: `gps-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
          city,
          state: "",
          label: name ? `${name} (GPS)` : `GPS ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          lat: latitude,
          lon: longitude,
        });
        setGpsState("idle");
      },
      () => setGpsState("error"),
      { timeout: 10_000, maximumAge: 300_000 }
    );
  };

  const results = search.data ?? [];
  const searching = trimmed.length >= 2;

  const row = (
    key: string,
    icon: "pin" | "clock" | "city",
    title: string,
    sub: string,
    isActive: boolean,
    onClick: () => void
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-left transition hover:bg-white/[0.06] active:scale-[0.98]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
        {icon === "pin" && <MapPin className="h-4 w-4 text-white/70" strokeWidth={2} />}
        {icon === "clock" && <Clock className="h-4 w-4 text-white/50" strokeWidth={2} />}
        {icon === "city" && <Building2 className="h-4 w-4 text-white/70" strokeWidth={2} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold">{title}</span>
        <span className="block truncate text-[11px] text-white/40">{sub}</span>
      </span>
      {isActive ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-300" strokeWidth={2.6} />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-white/20" strokeWidth={2.2} />
      )}
    </button>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search location">
          <motion.button  // eslint-disable-line
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="scrollbar-hide absolute inset-x-0 bottom-0 flex max-h-[86%] flex-col overflow-hidden rounded-t-[32px] border-t border-white/12 bg-[#10131d]/95 backdrop-blur-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="z-10 bg-gradient-to-b from-[#10131d] via-[#10131d]/95 to-transparent px-5 pb-3 pt-2.5">
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
              <div className="mt-3.5 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-[17px] font-bold">Find your place</h2>
                  <p className="mt-0.5 text-[12px] text-white/45">Any city, town or village on Earth.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close location search"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition active:scale-90"
                >
                  <X className="h-4 w-4 text-white/70" strokeWidth={2.4} />
                </button>
              </div>

              {/* search input */}
              <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 focus-within:border-white/30">
                <Search className="h-4 w-4 shrink-0 text-white/50" strokeWidth={2.4} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search — Try “Paris”, “Jaipur”, “Aizawl”…"
                  enterKeyHint="search"
                  autoCorrect="off"
                  autoCapitalize="words"
                  spellCheck={false}
                  aria-label="Search for a place"
                  className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-white placeholder:text-white/30 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition active:scale-90"
                  >
                    <X className="h-3 w-3 text-white/70" strokeWidth={2.6} />
                  </button>
                )}
              </div>
            </div>

            <div className="scrollbar-hide flex-1 space-y-1.5 overflow-y-auto px-5 pb-8">
              {/* GPS row */}
              {!searching && (
                <button
                  type="button"
                  onClick={useGPS}
                  disabled={gpsState === "locating"}
                  className="flex w-full items-center gap-3.5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-3.5 text-left transition active:scale-[0.98] disabled:opacity-70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15">
                    <LocateFixed className={`h-4 w-4 text-emerald-300 ${gpsState === "locating" ? "animate-pulse" : ""}`} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-emerald-100">
                      {gpsState === "locating" ? "Locating…" : "Use my current location"}
                    </span>
                    <span className="block text-[11px] text-emerald-200/50">
                      {gpsState === "error" ? "Permission denied or unavailable — try search" : "GPS · precise to your neighbourhood"}
                    </span>
                  </span>
                </button>
              )}

              {/* search states */}
              {searching && search.isPending &&
                [0, 1, 2].map((i) => <div key={i} className="skeleton h-[60px] rounded-2xl" />)}

              {searching && search.isError && (
                <div className="rounded-2xl border border-red-400/15 bg-red-500/[0.08] px-4 py-4 text-center">
                  <p className="text-[12.5px] font-semibold text-red-200">Search unavailable</p>
                  <button
                    type="button"
                    onClick={() => void search.refetch()}
                    className="mt-2 rounded-full border border-red-300/25 bg-red-400/15 px-4 py-1.5 text-[11.5px] font-bold text-red-200 transition active:scale-95"
                  >
                    Retry
                  </button>
                </div>
              )}

              {searching && search.isSuccess && results.length === 0 && (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <Globe2 className="h-8 w-8 text-white/25" strokeWidth={1.6} />
                  <p className="mt-3 text-[13px] font-semibold text-white/70">No matches for “{trimmed}”</p>
                  <p className="mt-1 text-[11.5px] text-white/35">Check the spelling or add a state/country.</p>
                </div>
              )}

              {searching &&
                search.isSuccess &&
                results.map((p) => {
                  const loc = placeToLocation(p);
                  return row(
                    String(p.id),
                    "pin",
                    p.name,
                    [p.admin1, p.country].filter(Boolean).join(", "),
                    loc.id === activeId,
                    () => pick(loc)
                  );
                })}

              {/* idle: recents + quick picks */}
              {!searching && recents.length > 0 && (
                <>
                  <p className="px-1 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Recent searches</p>
                  {recents.map((r) => row(r.id, "clock", r.city, r.state || "Searched place", r.id === activeId, () => pick(r)))}
                </>
              )}

              {!searching && (
                <>
                  <p className="px-1 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Quick picks</p>
                  {PRESET_LOCATIONS.map((l) => row(l.id, "city", l.city, l.state, l.id === activeId, () => pick(l)))}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
