import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plane, Search, TrainFront, Bus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchTravelPlaces } from "../../services/openMeteo";
import { useAppStore } from "../../store/useAppStore";
import type { TravelMode, TravelPlan, TravelType } from "../../storage/mmkv";
import type { LocationMeta } from "../../types/sdui";

export function TravelSheet() {
  const open = useAppStore((s) => s.travelSheetOpen);
  const setOpen = useAppStore((s) => s.setTravelSheetOpen);
  const location = useAppStore((s) => s.location);
  const saved = useAppStore((s) => s.travelPlan);
  const setPlan = useAppStore((s) => s.setTravelPlan);
  const [type, setType] = useState<TravelType>("domestic");
  const [mode, setMode] = useState<TravelMode>("train");
  const [field, setField] = useState<"origin" | "destination">("destination");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState<LocationMeta>(location);
  const [destination, setDestination] = useState<LocationMeta | null>(null);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().slice(0, 10));
  const [flightNumber, setFlightNumber] = useState("");

  useEffect(() => {
    if (!open) return;
    setType(saved?.type ?? "domestic");
    setMode(saved?.mode ?? "train");
    setOrigin(saved?.origin ?? location);
    setDestination(saved?.destination ?? null);
    setTravelDate(saved?.travelDate ?? new Date().toISOString().slice(0, 10));
    setFlightNumber(saved?.flightNumber ?? "");
    setField("destination");
    setQuery("");
  }, [open, location, saved]);

  const search = useQuery({
    queryKey: ["travel-place-search", field, query.trim(), origin.lat, origin.lon],
    queryFn: ({ signal }) => searchTravelPlaces(query.trim(), signal),
    enabled: query.trim().length >= 2,
    staleTime: 10 * 60_000,
  });

  const save = () => {
    if (!destination) return;
    const plan: TravelPlan = { type, mode, origin, destination, travelDate, flightNumber: flightNumber.trim() || undefined };
    setPlan(plan);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="Plan a trip">
        <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        <motion.div className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[32px] border-t border-white/12 bg-[#10131d]/95 px-5 pb-8 pt-3 backdrop-blur-2xl" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
          <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
          <div className="mt-4 flex items-center justify-between"><div><h2 className="font-display text-[17px] font-bold">Plan your trip</h2><p className="mt-0.5 text-[12px] text-white/45">Weather and travel options for your journey.</p></div><button type="button" aria-label="Close trip planner" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"><X className="h-4 w-4" /></button></div>
          <div className="mt-5 grid grid-cols-2 gap-2">{(["domestic", "international"] as TravelType[]).map((value) => <button key={value} type="button" onClick={() => setType(value)} className={`rounded-xl border px-3 py-2 text-[12px] font-bold capitalize ${type === value ? "border-violet-300/40 bg-violet-300/15 text-violet-100" : "border-white/10 bg-white/[0.04] text-white/55"}`}>{value}</button>)}</div>
          <div className="mt-2 grid grid-cols-3 gap-2">{([['flight', Plane], ['bus', Bus], ['train', TrainFront]] as const).map(([value, Icon]) => <button key={value} type="button" onClick={() => setMode(value)} className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-bold capitalize ${mode === value ? "border-sky-300/40 bg-sky-300/15 text-sky-100" : "border-white/10 bg-white/[0.04] text-white/55"}`}><Icon className="h-3.5 w-3.5" />{value}</button>)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2"><label className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">Travel date</span><input type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} className="mt-1 w-full bg-transparent text-[12px] text-white focus:outline-none" /></label>{type === "international" && mode === "flight" ? <label className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">Flight number</span><input value={flightNumber} onChange={(event) => setFlightNumber(event.target.value.toUpperCase())} placeholder="e.g. AI101" className="mt-1 w-full bg-transparent text-[12px] text-white placeholder:text-white/30 focus:outline-none" /></label> : <div />}</div>
          <div className="mt-4 space-y-2"><button type="button" onClick={() => { setField("origin"); setQuery(""); }} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${field === "origin" ? "border-sky-300/35 bg-sky-300/[0.10]" : "border-white/10 bg-white/[0.04]"}`}><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">From</span><span className="truncate text-[13px] font-semibold">{origin.label}</span></button><button type="button" onClick={() => { setField("destination"); setQuery(""); }} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${field === "destination" ? "border-emerald-300/35 bg-emerald-300/[0.10]" : "border-white/10 bg-white/[0.04]"}`}><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">To</span><span className="truncate text-[13px] font-semibold">{destination?.label ?? "Choose destination"}</span></button></div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3"><Search className="h-4 w-4 text-white/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${field} — e.g. airport, station, city`} aria-label={`Search trip ${field}`} className="min-w-0 flex-1 bg-transparent text-[14px] focus:outline-none" /></div>
          <div className="mt-3 space-y-1.5">{search.isPending && <p className="px-2 py-3 text-[12px] text-white/40">Searching places...</p>}{search.isError && <p className="px-2 py-3 text-[12px] text-red-200">Place search unavailable.</p>}{search.data?.map((place) => <button key={place.id} type="button" onClick={() => { if (field === "origin") setOrigin(place); else setDestination(place); setQuery(""); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-left"><Check className="h-4 w-4 text-emerald-300" /><span className="min-w-0"><span className="block truncate text-[13px] font-semibold">{place.city}</span><span className="block truncate text-[11px] text-white/40">{place.label}</span></span></button>)}</div>
          <button type="button" disabled={!destination} onClick={save} className="mt-5 w-full rounded-2xl bg-violet-400 px-4 py-3 text-[12px] font-bold text-slate-950 disabled:opacity-35">Save travel plan</button>{saved && <button type="button" onClick={() => { setPlan(null); setOpen(false); }} className="mt-2 w-full rounded-2xl border border-red-300/15 bg-red-400/[0.08] px-4 py-3 text-[12px] text-red-200">Remove travel plan</button>}
        </motion.div>
      </div>}
    </AnimatePresence>
  );
}
