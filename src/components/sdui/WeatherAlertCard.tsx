/**
 * SDUI "WeatherAlert" — official warning banner with severity styling.
 */
import { AlertTriangle, ChevronRight, ShieldAlert } from "lucide-react";
import type { AlertProps } from "../../types/sdui";

const SEVERITY_STYLES = {
  red: {
    wrap: "border-red-400/25 bg-red-500/[0.10]",
    chip: "bg-red-500/20 text-red-200 border-red-400/30",
    icon: "text-red-300",
    bubble: "bg-red-500/20 border-red-400/25",
  },
  amber: {
    wrap: "border-amber-400/25 bg-amber-500/[0.09]",
    chip: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    icon: "text-amber-300",
    bubble: "bg-amber-500/20 border-amber-400/25",
  },
  yellow: {
    wrap: "border-yellow-300/20 bg-yellow-400/[0.08]",
    chip: "bg-yellow-400/15 text-yellow-200 border-yellow-300/25",
    icon: "text-yellow-200",
    bubble: "bg-yellow-400/15 border-yellow-300/20",
  },
} as const;

const SEVERITY_LABEL = { red: "Severe", amber: "Warning", yellow: "Advisory" } as const;

export function WeatherAlertCard(props: AlertProps) {
  const s = SEVERITY_STYLES[props.severity] ?? SEVERITY_STYLES.amber;
  return (
    <div className={`rounded-[28px] border p-5 backdrop-blur-xl ${s.wrap}`} role="alert">
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${s.bubble} ${
            props.severity === "red" ? "pulse-alert" : ""
          }`}
        >
          {props.severity === "red" ? (
            <ShieldAlert className={`h-5 w-5 ${s.icon}`} strokeWidth={2} />
          ) : (
            <AlertTriangle className={`h-5 w-5 ${s.icon}`} strokeWidth={2} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${s.chip}`}>
              {SEVERITY_LABEL[props.severity] ?? "Alert"}
            </span>
            <span className="text-[11px] text-white/40">{props.issuedAt}</span>
          </div>
          <h3 className="mt-2 font-display text-[15px] font-semibold leading-snug">{props.title}</h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/65">{props.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/40">{props.source}</span>
            {props.action && (
              <button
                type="button"
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition active:scale-95 ${s.chip}`}
              >
                {props.action}
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
