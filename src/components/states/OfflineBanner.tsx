/**
 * Subtle stale-data indicator shown when the API is unreachable but a
 * cached SDUI payload is on screen. Never blocks the UI.
 */
import { motion } from "framer-motion";
import { RefreshCw, WifiOff } from "lucide-react";
import { formatAgo } from "../../lib/format";

export function OfflineBanner({
  savedAt,
  retrying,
  onRetry,
}: {
  savedAt?: number;
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
      role="status"
    >
      <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-300/20 bg-amber-400/[0.10] px-4 py-2.5 backdrop-blur-xl">
        <WifiOff className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={2.2} />
        <div className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold text-amber-200">You're offline</span>
          <span className="block text-[10.5px] text-amber-200/60">
            Showing cached data · synced {formatAgo(savedAt)}
          </span>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/15 px-3 py-1.5 text-[11px] font-bold text-amber-200 transition active:scale-95"
        >
          <RefreshCw className={`h-3 w-3 ${retrying ? "spin-slow" : ""}`} strokeWidth={2.6} />
          Retry
        </button>
      </div>
    </motion.div>
  );
}
