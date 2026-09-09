/**
 * Component Registry — the heart of the SDUI architecture.
 *
 * Maps backend component type strings to frontend React components.
 * Security model:
 *  - Only types listed here can ever render (whitelist, no eval, no dynamic
 *    imports keyed by server data).
 *  - Optional prop validators run before render; invalid nodes are skipped.
 *  - Each rendered node is wrapped in an ErrorBoundary so one bad component
 *    can never take down the homepage.
 */
import { Component, type ComponentType, type ReactNode } from "react";
import { isObject } from "../types/sdui";
import { WeatherHero } from "../components/sdui/WeatherHero";
import { HourlyForecast } from "../components/sdui/HourlyForecast";
import { DailyForecast } from "../components/sdui/DailyForecast";
import { WeatherAlertCard } from "../components/sdui/WeatherAlertCard";
import { AdvisoryCard } from "../components/sdui/AdvisoryCard";
import { MetricsGrid } from "../components/sdui/MetricsGrid";
import { LocationSection } from "../components/sdui/LocationSection";

export interface RegistryEntry {
  render: ComponentType<any>;
  validate?: (props: unknown) => boolean;
}

/* ------------------------- prop validators ------------------------- */

const hasString = (o: Record<string, unknown>, k: string) => typeof o[k] === "string";
const hasNumber = (o: Record<string, unknown>, k: string) => typeof o[k] === "number";
const hasArray = (o: Record<string, unknown>, k: string) => Array.isArray(o[k]);

const validators: Record<string, (p: unknown) => boolean> = {
  WeatherHero: (p) => isObject(p) && hasNumber(p, "temperature") && hasString(p, "condition"),
  HourlyForecast: (p) => isObject(p) && hasArray(p, "hours"),
  DailyForecast: (p) => isObject(p) && hasArray(p, "days"),
  WeatherAlert: (p) => isObject(p) && hasString(p, "title") && hasString(p, "severity"),
  Advisory: (p) => isObject(p) && hasString(p, "title") && hasArray(p, "items"),
  MetricsGrid: (p) => isObject(p) && hasArray(p, "metrics"),
  LocationSection: (p) => isObject(p) && hasArray(p, "saved"),
};

/* ---------------------------- registry ------------------------------ */

export const COMPONENT_REGISTRY: Record<string, RegistryEntry> = {
  WeatherHero: { render: WeatherHero, validate: validators.WeatherHero },
  HourlyForecast: { render: HourlyForecast, validate: validators.HourlyForecast },
  DailyForecast: { render: DailyForecast, validate: validators.DailyForecast },
  WeatherAlert: { render: WeatherAlertCard, validate: validators.WeatherAlert },
  Advisory: { render: AdvisoryCard, validate: validators.Advisory },
  MetricsGrid: { render: MetricsGrid, validate: validators.MetricsGrid },
  LocationSection: { render: LocationSection, validate: validators.LocationSection },
};

/** Resolve a backend type string to a registry entry, or null if unknown. */
export function resolveComponent(type: string): RegistryEntry | null {
  const entry = COMPONENT_REGISTRY[type];
  if (!entry) {
    if (import.meta.env.DEV) {
      console.warn(`[SDUI] Unsupported component type "${type}" — skipped.`);
    }
    return null;
  }
  return entry;
}

/* ------------------------- error boundary --------------------------- */

interface BoundaryProps {
  children: ReactNode;
  nodeId: string;
}
interface BoundaryState {
  failed: boolean;
}

/** Isolates render failures to a single SDUI node. */
export class ComponentBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[SDUI] Component "${this.props.nodeId}" failed to render`, error);
  }

  render() {
    if (this.state.failed) return null; // graceful degradation
    return this.props.children;
  }
}
