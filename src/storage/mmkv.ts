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
  const valid: PersonaId[] = ["general", "farmer", "student", "traveller", "fisherman", "outdoor"];
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
