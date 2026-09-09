/**
 * Persona bottom sheet — switching persona:
 *   1. updates Zustand local state (+ MMKV persistence)
 *   2. fires the backend persona-update API call
 *   3. changes the TanStack Query key -> SDUI homepage refetch
 * Also hosts the developer "offline simulation" switch used to demo the
 * offline-first cache behavior.
 */
import { AnimatePresence, motion } from "framer-motion";
import { Check, FlaskConical, X } from "lucide-react";
import { resolveIcon } from "../../lib/icons";
import { postPersona } from "../../services/api";
import { PERSONAS } from "../../store/personas";
import { useAppStore } from "../../store/useAppStore";

export function PersonaSheet() {
  const open = useAppStore((s) => s.sheetOpen);
  const setOpen = useAppStore((s) => s.setSheetOpen);
  const persona = useAppStore((s) => s.persona);
  const setPersona = useAppStore((s) => s.setPersona);
  const forceOffline = useAppStore((s) => s.forceOffline);
  const setForceOffline = useAppStore((s) => s.setForceOffline);

  const pick = (id: (typeof PERSONAS)[number]["id"]) => {
    if (id !== persona) {
      setPersona(id); // local state + persistence
      void postPersona(id); // backend persona sync (non-blocking)
      // SDUI refetch happens automatically: query key includes persona
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="Choose persona">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[82%] overflow-y-auto rounded-t-[32px] border-t border-white/12 bg-[#10131d]/95 backdrop-blur-2xl scrollbar-hide"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#10131d] via-[#10131d]/90 to-transparent pb-2 pt-2.5">
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
              <div className="mt-3 flex items-center justify-between px-6">
                <div>
                  <h2 className="font-display text-[17px] font-bold">Who's checking the weather?</h2>
                  <p className="mt-0.5 text-[12px] text-white/45">Your homepage re-arranges itself per persona.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close persona selector"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition active:scale-90"
                >
                  <X className="h-4 w-4 text-white/70" strokeWidth={2.4} />
                </button>
              </div>
            </div>

            <div className="space-y-2 px-5 pb-3 pt-1">
              {PERSONAS.map((p) => {
                const Icon = resolveIcon(p.icon);
                const active = p.id === persona;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pick(p.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3.5 rounded-[22px] border p-3.5 text-left transition active:scale-[0.98] ${
                      active ? "border-white/25 bg-white/[0.10]" : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: `${p.accent}22`, color: p.accent }}
                    >
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[14.5px] font-semibold">{p.label}</span>
                      <span className="block truncate text-[11.5px] text-white/45">{p.tagline}</span>
                    </span>
                    {active ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20">
                        <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="h-6 w-6 rounded-full border border-white/12" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* developer options */}
            <div className="mx-5 mb-2 mt-2 rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-white/50">
                <FlaskConical className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Developer</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold">Simulate backend outage</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-white/40">
                    API calls fail — app keeps serving the cached SDUI payload.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={forceOffline}
                  onClick={() => setForceOffline(!forceOffline)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${forceOffline ? "bg-amber-400" : "bg-white/15"}`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      forceOffline ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <p className="px-6 pb-8 pt-1 text-center text-[10.5px] text-white/25">
              SDUI v1.0 · layouts rendered from server payloads
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
