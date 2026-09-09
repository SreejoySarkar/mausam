/**
 * Mausam — Server-Driven UI type system.
 *
 * Every shape here mirrors the contract served by the Node.js/Fastify
 * backend. The frontend never hardcodes layout: the backend decides which
 * components render, in which order, with which props.
 */

export type PersonaId =
  | "general"
  | "farmer"
  | "student"
  | "traveller"
  | "fisherman"
  | "outdoor";

export type ThemeId = "dusk" | "monsoon" | "heat" | "marine" | "cloud";

export type Severity = "red" | "amber" | "yellow";

export type Accent = "emerald" | "sky" | "violet" | "cyan" | "amber" | "rose" | "lime";

/* ------------------------------------------------------------------ */
/* Payload envelope                                                    */
/* ------------------------------------------------------------------ */

export interface LocationMeta {
  id: string;
  city: string;
  state: string;
  label: string;
  lat: number;
  lon: number;
}

export interface SDUIComponentNode<P = Record<string, unknown>> {
  id: string;
  type: string;
  props: P;
}

export interface SDUIPayload {
  version: string;
  persona: PersonaId;
  location: LocationMeta;
  theme: ThemeId;
  generatedAt: string; // ISO timestamp
  components: SDUIComponentNode[];
}

/* ------------------------------------------------------------------ */
/* Component prop contracts                                          */
/* ------------------------------------------------------------------ */

export interface QuickStat {
  icon: string;
  label: string;
  value: string;
}

export interface HeroProps {
  temperature: number;
  feelsLike: number;
  condition: string;
  icon: string;
  hi: number;
  lo: number;
  locationLabel: string;
  /** Persona-flavoured one-liner written by the backend. */
  summary: string;
  stats: QuickStat[];
}

export interface HourPoint {
  t: string;
  icon: string;
  temp: number;
  precip: number; // %
}

export interface HourlyProps {
  title: string;
  hours: HourPoint[];
}

export interface DayPoint {
  d: string;
  icon: string;
  hi: number;
  lo: number;
  precip: number;
}

export interface DailyProps {
  title: string;
  days: DayPoint[];
}

export interface AlertProps {
  severity: Severity;
  title: string;
  description: string;
  source: string;
  issuedAt: string;
  action?: string;
}

export interface AdvisoryMetric {
  label: string;
  value: string;
  sub?: string;
}

export type AdvisoryChart =
  | { kind: "rain-bars"; slots: { t: string; mm: number }[] }
  | { kind: "wind-compass"; deg: number; speed: number; gusts: number }
  | { kind: "heat-timeline"; from: number; to: number; danger: [number, number]; peak: number };

export interface AdvisoryItem {
  icon: string;
  title: string;
  body: string;
  tone?: "info" | "warn" | "danger" | "good";
}

export interface AdvisoryProps {
  icon: string;
  accent: Accent;
  title: string;
  subtitle: string;
  metrics: AdvisoryMetric[];
  chart?: AdvisoryChart;
  items: AdvisoryItem[];
  footnote?: string;
}

export type Gauge =
  | { kind: "ring"; pct: number; tint: string }
  | { kind: "uv"; value: number; max: number }
  | { kind: "compass"; deg: number }
  | { kind: "sunpath"; sunrise: string; sunset: string };

export interface MetricItem {
  id: string;
  icon: string;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  gauge?: Gauge;
}

export interface MetricsProps {
  title: string;
  metrics: MetricItem[];
}

export interface SavedLocation {
  id: string;
  city: string;
  state: string;
  icon: string;
}

export interface LocationSectionProps {
  title: string;
  gpsEnabled: boolean;
  current: { city: string; state: string; label: string };
  saved: SavedLocation[];
}

/* ------------------------------------------------------------------ */
/* Runtime guards — never trust the wire                               */
/* ------------------------------------------------------------------ */

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isValidPayload(v: unknown): v is SDUIPayload {
  if (!isObject(v)) return false;
  return (
    typeof v.version === "string" &&
    typeof v.persona === "string" &&
    isObject(v.location) &&
    typeof (v.location as Record<string, unknown>).id === "string" &&
    typeof v.theme === "string" &&
    typeof v.generatedAt === "string" &&
    Array.isArray(v.components)
  );
}
