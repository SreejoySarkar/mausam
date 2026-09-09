import type { DayPoint, HourPoint, ThemeId } from "./sdui";

/**
 * Normalized weather base consumed by the SDUI payload builders.
 * Produced either from curated presets (mock) or from the live
 * Open-Meteo provider for arbitrary searched locations.
 */
export interface LocationWeather {
  id: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  theme: ThemeId;
  temp: number;
  hi: number;
  lo: number;
  feels: number;
  condition: string;
  icon: string;
  humidity: number;
  windKmh: number;
  windDeg: number;
  gusts: number;
  uv: number;
  uvLabel: string;
  vis: number;
  visNote: string;
  pressure: number;
  sunrise: string;
  sunset: string;
  rainChance: number;
  wave?: number;
  seaState?: string;
  /** city-specific color used by advisory copy (optional for searched places) */
  landmark?: string;
  commuteRoute?: string;
  summary: string;
  /** live provider data — when present the forecast sections use it verbatim */
  hours?: HourPoint[];
  days?: DayPoint[];
}

/** One result from the geocoding search. */
export interface GeoPlace {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}
