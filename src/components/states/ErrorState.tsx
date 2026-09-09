/**
 * Hard error state — only reachable on a cold start with no cache at all.
 * Once any SDUI payload has been cached, users see the OfflineBanner + cached
 * UI instead of this screen.
 */
import { CloudOff, RefreshCw } from "lucide-react";

export function ErrorState({ retrying, onRetry }: { retrying: boolean; onRetry: () => void }) {
  return (
    <div className="glass flex flex-col items-center rounded-[32px] px-8 py-14 text-center" role="alert">
      <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.05]">
        <CloudOff className="h-8 w-8 text-white/50" strokeWidth={1.6} />
      </div>
      <h2 className="mt-5 font-display text-[17px] font-bold">Can't reach Mausam servers</h2>
      <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
        No cached homepage yet for this profile. Check your connection and we'll set everything up.
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-slate-900 transition active:scale-95 disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${retrying ? "spin-slow" : ""}`} strokeWidth={2.6} />
        {retrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}
