/**
 * Synchronous key-value storage — the web analogue of react-native-mmkv.
 *
 * In the Expo app this module is backed by `new MMKV()`; here it is backed
 * by localStorage with the *identical* synchronous read/write semantics so
 * the boot flow (instant cached render, no splash-blocking async) is the
 * same: reads happen synchronously at module/store init time.
 *
 * Only non-secret cache data is stored. No tokens, no secrets.
 */
import { isObject, isValidPayload, type LocationMeta, type PersonaId, type SDUIPayload } from "../types/sdui";
import { presetById } from "../lib/presets";

const PREFIX = "mausam.v1:";

export const storage = {
  getString(key: string): string | null {
    try {
      return window.localStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(PREFIX + key, value);
    } catch {
      /* storage full / unavailable — cache is best-effort */
    }
  },
  getJSON<T>(key: string): T | null {
    const raw = storage.getString(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null; // corrupted entry — treat as a cache miss
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* noop */
    }
  },
};

/* ------------------------------------------------------------------ */
/* Typed cache helpers                                                 */
/* ------------------------------------------------------------------ */

const KEYS = {
  persona: "persona",
  location: "location",
  recentLocations: "recentLocations",
  commuteRoute: "commuteRoute",
  travelPlan: "travelPlan",
  sdui: (persona: string, locationId: string) => `sdui:${persona}:${locationId}`,
};

export interface CachedSDUI {
  savedAt: number;
  payload: SDUIPayload;
}

export function readCachedSDUI(persona: string, locationId: string): CachedSDUI | null {
  const entry = storage.getJSON<CachedSDUI>(KEYS.sdui(persona, locationId));
  if (!entry || !isValidPayload(entry.payload)) return null;
  return entry;
}

export function writeCachedSDUI(persona: string, locationId: string, payload: SDUIPayload): void {
  if (!isValidPayload(payload)) return;
  storage.set(KEYS.sdui(persona, locationId), JSON.stringify({ savedAt: Date.now(), payload }));
}

export function readPersona(): PersonaId | null {
  const p = storage.getString(KEYS.persona);
  const valid: PersonaId[] = ["general", "farmer", "student", "traveller", "fisherman", "outdoor", "health", "parent", "event"];
  return valid.includes(p as PersonaId) ? (p as PersonaId) : null;
}

export function writePersona(persona: PersonaId): void {
  storage.set(KEYS.persona, persona);
}

/* ------------------------- active location ------------------------- */

function isLocationMeta(v: unknown): v is LocationMeta {
  if (!isObject(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.city === "string" &&
    typeof v.lat === "number" &&
    typeof v.lon === "number"
  );
}

/** Reads the active location; migrates legacy plain-string preset ids. */
export function readLocation(): LocationMeta | null {
  const raw = storage.getString(KEYS.location);
  if (!raw) return null;
  if (raw.startsWith("{")) {
    const parsed = storage.getJSON<LocationMeta>(KEYS.location);
    return parsed && isLocationMeta(parsed) ? parsed : null;
  }
  return presetById(raw); // legacy format: bare preset id
}

export function writeLocation(loc: LocationMeta): void {
  storage.set(KEYS.location, JSON.stringify(loc));
}

/* ------------------------ recent searched places ------------------- */

export function readRecentLocations(): LocationMeta[] {
  const list = storage.getJSON<unknown[]>(KEYS.recentLocations);
  if (!Array.isArray(list)) return [];
  return list.filter(isLocationMeta).slice(0, 5);
}

export function writeRecentLocations(list: LocationMeta[]): void {
  storage.set(KEYS.recentLocations, JSON.stringify(list.slice(0, 5)));
}

export interface CommuteRoute {
  origin: LocationMeta;
  destination: LocationMeta;
}

export function readCommuteRoute(): CommuteRoute | null {
  const route = storage.getJSON<unknown>(KEYS.commuteRoute);
  if (!isObject(route) || !isLocationMeta(route.origin) || !isLocationMeta(route.destination)) return null;
  return { origin: route.origin, destination: route.destination };
}

export function writeCommuteRoute(route: CommuteRoute | null): void {
  if (route) storage.set(KEYS.commuteRoute, JSON.stringify(route));
  else storage.remove(KEYS.commuteRoute);
}

export type TravelType = "domestic" | "international";
export type TravelMode = "flight" | "bus" | "train";

export interface TravelPlan {
  type: TravelType;
  mode: TravelMode;
  origin: LocationMeta;
  destination: LocationMeta;
  travelDate: string;
  flightNumber?: string;
}

export function readTravelPlan(): TravelPlan | null {
  const plan = storage.getJSON<unknown>(KEYS.travelPlan);
  if (!isObject(plan) || !isLocationMeta(plan.origin) || !isLocationMeta(plan.destination)) return null;
  if ((plan.type !== "domestic" && plan.type !== "international") || !["flight", "bus", "train"].includes(String(plan.mode))) return null;
  if (typeof plan.travelDate !== "string") return null;
  return { type: plan.type, mode: plan.mode, origin: plan.origin, destination: plan.destination, travelDate: plan.travelDate, flightNumber: typeof plan.flightNumber === "string" ? plan.flightNumber : undefined } as TravelPlan;
}

export function writeTravelPlan(plan: TravelPlan | null): void {
  if (plan) storage.set(KEYS.travelPlan, JSON.stringify(plan));
  else storage.remove(KEYS.travelPlan);
}
