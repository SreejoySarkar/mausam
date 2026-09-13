import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { WeatherAlertCard } from "../sdui/WeatherAlertCard";
import type { AlertProps } from "../../types/sdui";

export function NotificationSheet({ alerts, open, onClose }: { alerts: AlertProps[]; open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-50" role="dialog" aria-modal="true" aria-label="Notifications">
          <motion.button type="button" aria-label="Close notifications" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[32px] border-t border-white/12 bg-[#10131d]/95 px-5 pb-8 pt-3 backdrop-blur-2xl" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[17px] font-bold">Notifications</h2>
                <p className="mt-0.5 text-[12px] text-white/45">Weather alerts for your current location.</p>
              </div>
              <button type="button" aria-label="Close notifications" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-5 space-y-3">
              {alerts.length > 0 ? alerts.map((alert, index) => <WeatherAlertCard key={`${alert.title}-${index}`} {...alert} />) : (
                <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-10 text-center">
                  <Bell className="h-7 w-7 text-white/35" />
                  <p className="mt-3 text-[13px] font-semibold text-white/75">No active weather alerts</p>
                  <p className="mt-1 text-[11.5px] text-white/40">New alerts will appear here when the forecast changes.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}