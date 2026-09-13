import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Check, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchCommutePlaces } from "../../services/openMeteo";
import { useAppStore } from "../../store/useAppStore";
import type { CommuteRoute } from "../../storage/mmkv";
import type { LocationMeta } from "../../types/sdui";

type SearchField = "origin" | "destination";

export function CommuteSheet() {
  const open = useAppStore((s) => s.commuteSheetOpen);
  const setOpen = useAppStore((s) => s.setCommuteSheetOpen);
  const location = useAppStore((s) => s.location);
  const savedRoute = useAppStore((s) => s.commuteRoute);
  const setRoute = useAppStore((s) => s.setCommuteRoute);
  const [field, setField] = useState<SearchField>("destination");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<LocationMeta>(location);
  const [destination, setDestination] = useState<LocationMeta | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (!open) return;
    setField("destination");
    setQuery("");
    setOrigin(savedRoute?.origin ?? location);
    setDestination(savedRoute?.destination ?? null);
  }, [open, location, savedRoute]);

  const search = useQuery({
    queryKey: ["commute-place-search", field, trimmed, origin.lat, origin.lon],
    queryFn: ({ signal }) => searchCommutePlaces(trimmed, origin.lat, origin.lon, signal),
    enabled: trimmed.length >= 2,
    staleTime: 10 * 60_000,
  });

  const selectPlace = (place: LocationMeta) => {
    if (field === "origin") setOrigin(place);
    else setDestination(place);
    setQuery("");
  };

  const saveRoute = () => {
    if (!destination) return;
    const route: CommuteRoute = { origin, destination };
    setRoute(route);
    setOpen(false);
  };

  const clearRoute = () => {
    setRoute(null);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="Set commute route">
          <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div className="absolute inset-x-0 bottom-0 max-h-[86%] overflow-y-auto rounded-t-[32px] border-t border-white/12 bg-[#10131d]/95 px-5 pb-8 pt-3 backdrop-blur-2xl" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[17px] font-bold">Commute route</h2>
                <p className="mt-0.5 text-[12px] text-white/45">Choose exact places for live route traffic.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close commute setup" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"><X className="h-4 w-4 text-white/70" /></button>
            </div>

            <div className="mt-5 space-y-2">
              <button type="button" onClick={() => { setField("origin"); setQuery(""); }} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${field === "origin" ? "border-sky-300/35 bg-sky-300/[0.10]" : "border-white/10 bg-white/[0.04]"}`}>
                <Car className="h-4 w-4 text-sky-300" />
                <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">From</span><span className="block truncate text-[13px] font-semibold">{origin.label}</span></span>
              </button>
              <button type="button" onClick={() => { setField("destination"); setQuery(""); }} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${field === "destination" ? "border-emerald-300/35 bg-emerald-300/[0.10]" : "border-white/10 bg-white/[0.04]"}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                <span className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">To</span><span className="block truncate text-[13px] font-semibold">{destination?.label ?? "Choose a destination"}</span></span>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 focus-within:border-white/30">
              <Search className="h-4 w-4 shrink-0 text-white/50" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${field === "origin" ? "starting point" : "destination"} — e.g. Park Street`} aria-label={`Search commute ${field}`} className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none" />
            </div>

            <div className="mt-3 space-y-1.5">
              {search.isPending && <p className="px-2 py-4 text-[12px] text-white/40">Searching places...</p>}
              {search.isError && <p className="px-2 py-4 text-[12px] text-red-200">Place search unavailable. Check the gateway.</p>}
              {search.data?.map((place) => (
                <button key={place.id} type="button" onClick={() => selectPlace(place)} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-left hover:bg-white/[0.06]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10"><Check className="h-4 w-4 text-emerald-300" /></span>
                  <span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{place.city}</span><span className="block truncate text-[11px] text-white/40">{place.label}</span></span>
                </button>
              ))}
            </div>

            <button type="button" disabled={!destination} onClick={saveRoute} className="mt-5 w-full rounded-2xl bg-emerald-400 px-4 py-3 text-[12px] font-bold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-35">Save commute route</button>
            {savedRoute && <button type="button" onClick={clearRoute} className="mt-2 w-full rounded-2xl border border-red-300/15 bg-red-400/[0.08] px-4 py-3 text-[12px] font-semibold text-red-200">Remove saved route</button>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
