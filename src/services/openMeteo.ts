/**
 * Live provider (dev stand-in for the Fastify service's upstream calls).
 *
 *  - Geocoding search: any place on Earth, no API key, CORS-friendly
 *  - Forecast: Open-Meteo current/hourly/daily
 *  - Reverse geocode (GPS): BigDataCloud free client endpoint
 *
 * In production, the Fastify backend performs these calls server-side and
 * ships only the SDUI payload to the app.
 */
import type { LocationMeta } from "../types/sdui";
import type { GeoPlace, LocationWeather } from "../types/weather";
import type { DayPoint, HourPoint, ThemeId } from "../types/sdui";
import { hourLabel } from "../lib/format";

/* ----------------------------- geocoding ----------------------------- */

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Place search failed");
  const data = await res.json();
  const results = data?.results;
  if (!Array.isArray(results)) return [];
  return results
    .filter((r: unknown): r is GeoPlace => typeof (r as GeoPlace)?.latitude === "number")
    .slice(0, 8);
}

export function placeToLocation(p: GeoPlace): LocationMeta {
  const region = p.admin1 || p.country || "";
  return {
    id: `geo-${p.id}`,
    city: p.name,
    state: region,
    label: region ? `${p.name}, ${region}` : p.name,
    lat: p.latitude,
    lon: p.longitude,
  };
}

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.city || data?.locality || data?.principalSubdivision || null;
  } catch {
    return null;
  }
}

/* --------------------------- WMO code mapping ------------------------ */

interface WmoInfo {
  condition: string;
  dayIcon: string;
  nightIcon: string;
  theme: ThemeId;
}

function wmo(code: number): WmoInfo {
  if (code === 0 || code === 1) return { condition: code === 0 ? "Clear Sky" : "Mainly Clear", dayIcon: "Sun", nightIcon: "Moon", theme: "marine" };
  if (code === 2) return { condition: "Partly Cloudy", dayIcon: "CloudSun", nightIcon: "CloudMoon", theme: "dusk" };
  if (code === 3) return { condition: "Overcast", dayIcon: "Cloudy", nightIcon: "Cloudy", theme: "cloud" };
  if (code === 45 || code === 48) return { condition: "Foggy", dayIcon: "CloudFog", nightIcon: "CloudFog", theme: "cloud" };
  if (code >= 51 && code <= 57) return { condition: "Drizzle", dayIcon: "CloudDrizzle", nightIcon: "CloudDrizzle", theme: "cloud" };
  if (code >= 61 && code <= 63) return { condition: "Rain", dayIcon: "CloudRain", nightIcon: "CloudRain", theme: "monsoon" };
  if (code >= 65 && code <= 67) return { condition: "Heavy Rain", dayIcon: "CloudRain", nightIcon: "CloudRain", theme: "monsoon" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { condition: "Snow", dayIcon: "CloudSnow", nightIcon: "CloudSnow", theme: "cloud" };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", dayIcon: "CloudRain", nightIcon: "CloudRain", theme: "monsoon" };
  if (code >= 95) return { condition: "Thunderstorm", dayIcon: "CloudLightning", nightIcon: "CloudLightning", theme: "monsoon" };
  return { condition: "Cloudy", dayIcon: "Cloudy", nightIcon: "Cloudy", theme: "cloud" };
}

function uvLabeling(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function visNote(km: number): string {
  if (km < 1) return "Very poor — fog";
  if (km < 4) return "Poor";
  if (km < 8) return "Haze";
  return "Clear";
}

function hmToLabel(hm: string): string {
  // "05:32" -> "5:32 AM"
  const h = parseInt(hm.slice(0, 2), 10);
  const m = hm.slice(3, 5);
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${m} ${suffix}`;
}

const THEME_SUMMARY: Record<ThemeId, string> = {
  marine: "Clear and bright — a fine day to be outside.",
  dusk: "Broken clouds with a pleasant evening ahead.",
  cloud: "Grey and settled; an umbrella is a fair bet later.",
  monsoon: "Wet conditions — plan around the rain bands.",
  heat: "Hot and dry. Limit direct midday sun.",
};

/* --------------------------- live weather ---------------------------- */

export async function buildLiveWeather(loc: LocationMeta, signal?: AbortSignal): Promise<LocationWeather> {
  const params = new URLSearchParams({
    latitude: String(loc.lat),
    longitude: String(loc.lon),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl",
    hourly: "temperature_2m,precipitation_probability,weather_code,visibility",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
    forecast_days: "8",
    timezone: "auto",
    wind_speed_unit: "kmh",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) throw new Error("Weather provider failed");
  const d = await res.json();
  if (!d?.current || !d?.daily) throw new Error("Malformed provider response");

  const cur = d.current;
  const info = wmo(cur.weather_code ?? 3);
  const temp = Math.round(cur.temperature_2m ?? 25);
  const hi = Math.round(d.daily.temperature_2m_max?.[0] ?? temp + 2);
  const lo = Math.round(d.daily.temperature_2m_min?.[0] ?? temp - 5);
  const windDeg = Math.round(cur.wind_direction_10m ?? 0);
  const windKmh = Math.round(cur.wind_speed_10m ?? 8);
  const uv = Math.round(d.daily.uv_index_max?.[0] ?? 5);
  const code = cur.weather_code ?? 3;

  // theme refinement: clear + very hot => heat theme
  let theme: ThemeId = info.theme;
  if ((code === 0 || code === 1) && temp >= 34) theme = "heat";
  if ((code === 0 || code === 1) && cur.is_day === 0) theme = "dusk";

  // hourly slice from "now"
  const times: string[] = d.hourly?.time ?? [];
  let nowIdx = times.findIndex((t) => t >= cur.time);
  if (nowIdx < 0) nowIdx = 0;
  const iconFor = (c: number, hour: number) => {
    const i = wmo(c);
    const isDay = hour >= 6 && hour <= 18;
    return isDay ? i.dayIcon : i.nightIcon;
  };
  const hours: HourPoint[] = times.slice(nowIdx, nowIdx + 12).map((t, i) => ({
    t: i === 0 ? "Now" : hourLabel(parseInt(t.slice(11, 13), 10)),
    icon: iconFor(d.hourly.weather_code?.[nowIdx + i] ?? 3, parseInt(t.slice(11, 13), 10)),
    temp: Math.round(d.hourly.temperature_2m?.[nowIdx + i] ?? temp),
    precip: Math.round(d.hourly.precipitation_probability?.[nowIdx + i] ?? 0),
  }));

  const days: DayPoint[] = (d.daily.time ?? []).slice(0, 7).map((dateStr: string, i: number) => ({
    d: i === 0 ? "Today" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(`${dateStr}T12:00:00`).getDay()],
    icon: wmo(d.daily.weather_code?.[i] ?? 3).dayIcon,
    hi: Math.round(d.daily.temperature_2m_max?.[i] ?? hi),
    lo: Math.round(d.daily.temperature_2m_min?.[i] ?? lo),
    precip: Math.round(d.daily.precipitation_probability_max?.[i] ?? 0),
  }));

  const visKm = typeof d.hourly?.visibility?.[nowIdx] === "number" ? Math.round(d.hourly.visibility[nowIdx] / 100) / 10 : 10;
  const sunriseISO: string = d.daily.sunrise?.[0] ?? "T06:00";
  const sunsetISO: string = d.daily.sunset?.[0] ?? "T18:00";

  return {
    id: loc.id,
    city: loc.city,
    state: loc.state,
    lat: loc.lat,
    lon: loc.lon,
    theme,
    temp,
    hi,
    lo,
    feels: Math.round(cur.apparent_temperature ?? temp),
    condition: info.condition,
    icon: cur.is_day === 0 ? info.nightIcon : info.dayIcon,
    humidity: Math.round(cur.relative_humidity_2m ?? 60),
    windKmh,
    windDeg,
    gusts: Math.round(cur.wind_gusts_10m ?? windKmh * 1.5),
    uv,
    uvLabel: uvLabeling(uv),
    vis: visKm,
    visNote: visNote(visKm),
    pressure: Math.round(cur.pressure_msl ?? 1010),
    sunrise: hmToLabel(sunriseISO.slice(11, 16)),
    sunset: hmToLabel(sunsetISO.slice(11, 16)),
    rainChance: Math.round(d.daily.precipitation_probability_max?.[0] ?? 20),
    summary: THEME_SUMMARY[theme],
    hours: hours.length ? hours : undefined,
    days: days.length ? days : undefined,
  };
}
