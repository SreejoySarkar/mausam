/**
 * Zustand store — LOCAL/UI state only.
 *
 * Server state (the SDUI homepage payload) is owned by TanStack Query.
 * This store holds the active persona, active location (preset or searched),
 * recent searches, offline simulation flag, connectivity, and ephemeral UI
 * state. Initial values are read synchronously from MMKV at app boot.
 */
import { create } from "zustand";
import {
  readLocation,
  readCommuteRoute,
  readPersona,
  readRecentLocations,
  readTravelPlan,
  writeLocation,
  writeCommuteRoute,
  writePersona,
  writeRecentLocations,
  writeTravelPlan,
} from "../storage/mmkv";
import { DEFAULT_LOCATION } from "../lib/presets";
import type { LocationMeta, PersonaId, ThemeId } from "../types/sdui";
import type { CommuteRoute, TravelPlan } from "../storage/mmkv";

interface AppState {
  persona: PersonaId;
  location: LocationMeta;
  recentLocations: LocationMeta[];
  commuteRoute: CommuteRoute | null;
  travelPlan: TravelPlan | null;
  /** atmosphere currently rendered — driven by the SDUI payload */
  theme: ThemeId;
  /** dev switch — simulates a backend outage to demo offline-first cache */
  forceOffline: boolean;
  online: boolean;
  sheetOpen: boolean;
  locationSheetOpen: boolean;

  setPersona: (p: PersonaId) => void;
  setLocation: (loc: LocationMeta) => void;
  pushRecentLocation: (loc: LocationMeta) => void;
  setTheme: (t: ThemeId) => void;
  setForceOffline: (v: boolean) => void;
  setOnline: (v: boolean) => void;
  setSheetOpen: (v: boolean) => void;
  setLocationSheetOpen: (v: boolean) => void;
  setCommuteRoute: (route: CommuteRoute | null) => void;
  commuteSheetOpen: boolean;
  setCommuteSheetOpen: (v: boolean) => void;
  travelSheetOpen: boolean;
  setTravelPlan: (plan: TravelPlan | null) => void;
  setTravelSheetOpen: (v: boolean) => void;
}

const VALID_THEMES: ThemeId[] = ["dusk", "monsoon", "heat", "marine", "cloud"];

export const useAppStore = create<AppState>((set, get) => ({
  persona: readPersona() ?? "general",
  location: readLocation() ?? DEFAULT_LOCATION,
  recentLocations: readRecentLocations(),
  commuteRoute: readCommuteRoute(),
  travelPlan: readTravelPlan(),
  theme: "cloud",
  forceOffline: false,
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  sheetOpen: false,
  locationSheetOpen: false,
  commuteSheetOpen: false,
  travelSheetOpen: false,

  setPersona: (persona) => {
    writePersona(persona); // persist selection (MMKV)
    set({ persona });
  },
  setLocation: (location) => {
    writeLocation(location);
    set({ location });
  },
  pushRecentLocation: (loc) => {
    const next = [loc, ...get().recentLocations.filter((r) => r.id !== loc.id)].slice(0, 5);
    writeRecentLocations(next);
    set({ recentLocations: next });
  },
  setTheme: (theme) => set(VALID_THEMES.includes(theme) ? { theme } : {}),
  setForceOffline: (forceOffline) => set({ forceOffline }),
  setOnline: (online) => set({ online }),
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
  setLocationSheetOpen: (locationSheetOpen) => set({ locationSheetOpen }),
  setCommuteRoute: (commuteRoute) => {
    writeCommuteRoute(commuteRoute);
    set({ commuteRoute });
  },
  setCommuteSheetOpen: (commuteSheetOpen) => set({ commuteSheetOpen }),
  setTravelPlan: (travelPlan) => {
    writeTravelPlan(travelPlan);
    set({ travelPlan });
  },
  setTravelSheetOpen: (travelSheetOpen) => set({ travelSheetOpen }),
}));
