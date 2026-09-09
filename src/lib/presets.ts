import type { LocationMeta } from "../types/sdui";

/** Curated quick-pick locations (instant, fully curated mock weather). */
export const PRESET_LOCATIONS: LocationMeta[] = [
  { id: "kolkata", city: "Kolkata", state: "West Bengal", label: "Kolkata, West Bengal", lat: 22.57, lon: 88.36 },
  { id: "mumbai", city: "Mumbai", state: "Maharashtra", label: "Mumbai, Maharashtra", lat: 19.08, lon: 72.88 },
  { id: "delhi", city: "New Delhi", state: "Delhi NCR", label: "New Delhi, Delhi NCR", lat: 28.61, lon: 77.21 },
  { id: "chennai", city: "Chennai", state: "Tamil Nadu", label: "Chennai, Tamil Nadu", lat: 13.08, lon: 80.27 },
  { id: "bengaluru", city: "Bengaluru", state: "Karnataka", label: "Bengaluru, Karnataka", lat: 12.97, lon: 77.59 },
];

export const DEFAULT_LOCATION = PRESET_LOCATIONS[0];

export function presetById(id: string): LocationMeta | null {
  return PRESET_LOCATIONS.find((l) => l.id === id) ?? null;
}
