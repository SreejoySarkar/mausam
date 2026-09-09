import { useEffect, useState } from "react";
import { BatteryFull, Signal, Wifi, WifiOff } from "lucide-react";
import { formatTimeShort } from "../../lib/format";
import { useAppStore } from "../../store/useAppStore";

/** Simulated device status bar (renders live time + connectivity). */
export function StatusBar() {
  const online = useAppStore((s) => s.online);
  const forceOffline = useAppStore((s) => s.forceOffline);
  const [now, setNow] = useState(() => formatTimeShort());

  useEffect(() => {
    const id = setInterval(() => setNow(formatTimeShort()), 20_000);
    return () => clearInterval(id);
  }, []);

  const offline = forceOffline || !online;

  return (
    <div className="relative z-40 flex items-center justify-between px-7 pb-1 pt-3.5">
      <span className="tnum font-display text-[12.5px] font-semibold tracking-wide text-white/90">{now}</span>
      <div className="flex items-center gap-1.5 text-white/85">
        <Signal className="h-3.5 w-3.5" strokeWidth={2.4} />
        {offline ? <WifiOff className="h-3.5 w-3.5 text-amber-300" strokeWidth={2.4} /> : <Wifi className="h-3.5 w-3.5" strokeWidth={2.4} />}
        <BatteryFull className="h-4 w-4" strokeWidth={2} />
      </div>
    </div>
  );
}
