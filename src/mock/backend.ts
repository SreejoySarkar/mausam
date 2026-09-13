/**
 * Mock SDUI backend — stands in for the Node.js/Fastify service during
 * development. In production these payload builders live server-side; the
 * mobile app swaps `mockFetchHome` for an axios call (see services/api.ts).
 *
 * Two sources of weather:
 *  - curated presets (instant, rich, deterministic) for quick-pick cities
 *  - LIVE Open-Meteo data for any searched location on Earth
 *
 * Both are normalized to the same SDUI payload contract — the renderer can
 * never tell the difference.
 */
import type {
  AdvisoryProps,
  AlertProps,
  DailyProps,
  DayPoint,
  HeroProps,
  HourlyProps,
  HourPoint,
  LocationMeta,
  LocationSectionProps,
  MetricsProps,
  PersonaId,
  SDUIComponentNode,
  SDUIPayload,
  ThemeId,
} from "../types/sdui";
import type { LocationWeather } from "../types/weather";
import { hourLabel } from "../lib/format";
import { buildLiveWeather } from "../services/openMeteo";

/* ------------------------------------------------------------------ */
/* Curated preset weather bases                                        */
/* ------------------------------------------------------------------ */

export const LOCATIONS: Record<string, LocationWeather> = {
  kolkata: {
    id: "kolkata", city: "Kolkata", state: "West Bengal", lat: 22.57, lon: 88.36,
    theme: "dusk", temp: 31, hi: 33, lo: 26, feels: 36,
    condition: "Partly Cloudy", icon: "CloudSun",
    humidity: 78, windKmh: 14, windDeg: 225, gusts: 22,
    uv: 6, uvLabel: "High", vis: 8, visNote: "Haze", pressure: 1004,
    sunrise: "5:32 AM", sunset: "6:24 PM", rainChance: 55,
    landmark: "Victoria Memorial", commuteRoute: "EM Bypass",
    summary: "Warm and humid with a chance of evening thundershowers.",
  },
  mumbai: {
    id: "mumbai", city: "Mumbai", state: "Maharashtra", lat: 19.08, lon: 72.88,
    theme: "monsoon", temp: 28, hi: 29, lo: 25, feels: 33,
    condition: "Heavy Rain", icon: "CloudRain",
    humidity: 89, windKmh: 26, windDeg: 270, gusts: 44,
    uv: 3, uvLabel: "Low", vis: 4, visNote: "Poor in rain", pressure: 998,
    sunrise: "6:04 AM", sunset: "7:18 PM", rainChance: 95,
    wave: 2.8, seaState: "Rough",
    landmark: "Marine Drive", commuteRoute: "Western Express Hwy",
    summary: "Continuous monsoon rain with strong westerly winds.",
  },
  delhi: {
    id: "delhi", city: "New Delhi", state: "Delhi NCR", lat: 28.61, lon: 77.21,
    theme: "heat", temp: 39, hi: 41, lo: 30, feels: 43,
    condition: "Clear Sky", icon: "Sun",
    humidity: 31, windKmh: 11, windDeg: 315, gusts: 18,
    uv: 11, uvLabel: "Extreme", vis: 6, visNote: "Dust haze", pressure: 1001,
    sunrise: "5:28 AM", sunset: "7:16 PM", rainChance: 2,
    landmark: "India Gate", commuteRoute: "Ring Road",
    summary: "Severe heat through the afternoon. Avoid direct sun after 11 AM.",
  },
  chennai: {
    id: "chennai", city: "Chennai", state: "Tamil Nadu", lat: 13.08, lon: 80.27,
    theme: "marine", temp: 33, hi: 35, lo: 28, feels: 40,
    condition: "Humid Sunshine", icon: "Sun",
    humidity: 74, windKmh: 18, windDeg: 135, gusts: 28,
    uv: 9, uvLabel: "Very High", vis: 9, visNote: "Clear", pressure: 1006,
    sunrise: "5:44 AM", sunset: "6:36 PM", rainChance: 30,
    wave: 1.2, seaState: "Moderate",
    landmark: "Marina Beach", commuteRoute: "OMR",
    summary: "Hot sea-breeze day; isolated showers possible late evening.",
  },
  bengaluru: {
    id: "bengaluru", city: "Bengaluru", state: "Karnataka", lat: 12.97, lon: 77.59,
    theme: "cloud", temp: 24, hi: 27, lo: 20, feels: 26,
    condition: "Overcast", icon: "Cloudy",
    humidity: 68, windKmh: 12, windDeg: 250, gusts: 19,
    uv: 4, uvLabel: "Moderate", vis: 10, visNote: "Good", pressure: 1012,
    sunrise: "5:56 AM", sunset: "6:42 PM", rainChance: 40,
    landmark: "Cubbon Park", commuteRoute: "Outer Ring Rd",
    summary: "Pleasant overcast morning; light drizzle likely by evening.",
  },
};

/* ------------------------------------------------------------------ */
/* Shared estimators                                                   */
/* ------------------------------------------------------------------ */

export function estimateWave(windKmh: number): number {
  return Math.min(4.5, Math.max(0.3, Math.round((windKmh / 12) * 10) / 10));
}

export function seaStateFor(wave: number): string {
  if (wave < 0.5) return "Calm";
  if (wave < 1.3) return "Slight";
  if (wave < 2.5) return "Moderate";
  if (wave < 4) return "Rough";
  return "Very rough";
}

const waveOf = (w: LocationWeather) => w.wave ?? estimateWave(w.windKmh);
const seaStateOf = (w: LocationWeather) => w.seaState ?? seaStateFor(waveOf(w));

/* ------------------------------------------------------------------ */
/* Payload builders                                                    */
/* ------------------------------------------------------------------ */

function diurnalTemp(hour: number, lo: number, hi: number): number {
  const t = (hour - 5) / 24;
  const f = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
  return Math.round(lo + (hi - lo) * f);
}

const HOUR_ICON_SEQ: Record<ThemeId, string[]> = {
  dusk: ["CloudSun", "Sun", "CloudSun", "Cloudy", "CloudSun", "CloudRain", "CloudDrizzle", "CloudRain", "CloudMoon", "Moon", "Cloudy", "CloudMoon"],
  monsoon: ["CloudRain", "CloudRain", "CloudLightning", "CloudRain", "CloudDrizzle", "CloudRain", "CloudLightning", "CloudRain", "CloudRain", "CloudDrizzle", "CloudRain", "CloudMoon"],
  heat: ["Sun", "Sun", "Sun", "Sun", "Sun", "Sun", "Sun", "Sun", "Sun", "CloudSun", "Moon", "Moon"],
  marine: ["Sun", "CloudSun", "Sun", "Sun", "CloudSun", "Sun", "Cloudy", "CloudSun", "CloudMoon", "Moon", "Cloudy", "CloudMoon"],
  cloud: ["Cloudy", "Cloudy", "CloudSun", "Cloudy", "CloudDrizzle", "Cloudy", "Cloudy", "CloudDrizzle", "CloudMoon", "Cloudy", "Moon", "CloudMoon"],
};

function buildHourly(w: LocationWeather): HourlyProps {
  if (w.hours && w.hours.length) return { title: "Hourly forecast", hours: w.hours };
  const now = new Date();
  const seq = HOUR_ICON_SEQ[w.theme];
  const hours: HourPoint[] = Array.from({ length: 12 }, (_, i) => {
    const h = now.getHours() + i;
    const rainBump = seq[i % seq.length].includes("Rain") || seq[i % seq.length].includes("Drizzle");
    return {
      t: i === 0 ? "Now" : hourLabel(h),
      icon: seq[i % seq.length],
      temp: diurnalTemp(h, w.lo, w.hi),
      precip: rainBump ? Math.min(96, w.rainChance + 18) : Math.max(2, w.rainChance - 30),
    };
  });
  return { title: "Hourly forecast", hours };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_ICON_SET: Record<ThemeId, string[]> = {
  dusk: ["CloudSun", "CloudRain", "CloudSun", "Cloudy", "CloudSun", "CloudDrizzle", "Sun"],
  monsoon: ["CloudRain", "CloudLightning", "CloudRain", "CloudDrizzle", "CloudRain", "CloudRain", "Cloudy"],
  heat: ["Sun", "Sun", "Sun", "CloudSun", "Sun", "Sun", "Sun"],
  marine: ["Sun", "CloudSun", "Sun", "Cloudy", "CloudSun", "Sun", "CloudDrizzle"],
  cloud: ["CloudSun", "Cloudy", "CloudDrizzle", "CloudSun", "Sun", "Cloudy", "CloudSun"],
};

function buildDaily(w: LocationWeather): DailyProps {
  if (w.days && w.days.length) return { title: `${w.days.length}-day forecast`, days: w.days };
  const icons = DAY_ICON_SET[w.theme];
  const days: DayPoint[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const jitter = ((i * 7) % 5) - 2;
    const rainy = icons[i].includes("Rain") || icons[i].includes("Drizzle") || icons[i].includes("Lightning");
    return {
      d: i === 0 ? "Today" : DAY_NAMES[d.getDay()],
      icon: icons[i],
      hi: w.hi + jitter,
      lo: w.lo + (((i * 3) % 4) - 1),
      precip: rainy ? Math.min(96, w.rainChance + 20) : Math.max(2, w.rainChance - 34),
    };
  });
  return { title: "7-day forecast", days };
}

/* ------------------------------ alerts ---------------------------- */

function buildAlerts(persona: PersonaId, w: LocationWeather): AlertProps[] {
  const alerts: AlertProps[] = [];
  if (w.theme === "monsoon") {
    alerts.push({
      severity: w.rainChance >= 85 ? "red" : "amber",
      title: w.rainChance >= 85 ? "Very Heavy Rainfall Warning" : "Rain & Gusty Winds Expected",
      description:
        w.rainChance >= 85
          ? "Heavy rain likely over the next 24 hours with waterlogging in low-lying areas and gusty winds."
          : "Spells of rain with gusty winds expected through the day. Plan travel with buffer time.",
      source: "National Met Service · Regional Centre",
      issuedAt: w.hours ? w.hours[0]?.t ?? "Today" : "8:05 AM",
      action: "Safety tips",
    });
  }
  if (w.theme === "heat") {
    alerts.push({
      severity: "red",
      title: "Heatwave — Severe Alert",
      description:
        "Maximum temperature is dangerously high. Risk of heat stroke between 11 AM and 4 PM. Stay indoors and hydrate frequently.",
      source: "National Met Service",
      issuedAt: "7:40 AM",
      action: "Precautions",
    });
  }
  if (w.theme === "dusk" && (persona === "farmer" || persona === "outdoor" || persona === "general")) {
    alerts.push({
      severity: "amber",
      title: "Thunderstorm & Lightning Likely",
      description: "Convective cells developing nearby. Lightning and gusty winds expected between late afternoon and evening.",
      source: "Met Nowcast",
      issuedAt: "11:20 AM",
    });
  }
  if (persona === "fisherman") {
    const wave = waveOf(w);
    const rough = w.theme === "monsoon" || wave >= 2.5;
    alerts.push({
      severity: rough ? "red" : "amber",
      title: rough ? "Do Not Venture Into Sea" : "Rough Sea / Squall Warning",
      description: rough
        ? `Sea condition very rough with swell waves near ${wave} m. All fishing operations should stay suspended.`
        : "Squally weather with strengthening winds likely over the coast after 2 PM. Return to shore before noon.",
      source: "Ocean State Forecast",
      issuedAt: "5:30 AM",
      action: rough ? undefined : "Tide chart",
    });
  }
  if (persona === "student" && w.theme === "monsoon") {
    alerts.push({
      severity: "yellow",
      title: "Waterlogging on Commute Routes",
      description: "Slow traffic and standing water reported near underpasses. Leave 20 minutes early.",
      source: "City Traffic Police",
      issuedAt: "7:15 AM",
    });
  }
  return alerts.slice(0, 2);
}

/* --------------------------- advisories --------------------------- */

function buildAdvisory(persona: PersonaId, w: LocationWeather): AdvisoryProps {
  const landmark = w.landmark ?? "the city center";
  const route = w.commuteRoute ?? "your usual route";
  switch (persona) {
    case "farmer":
      return {
        icon: "Sprout",
        accent: "emerald",
        title: "Agri Advisory",
        subtitle: `Season advisory · ${w.city} belt`,
        metrics: [
          { label: "Rain · 24h", value: w.theme === "monsoon" ? `${Math.round(w.rainChance / 1.5)} mm` : w.theme === "heat" ? "0 mm" : "12 mm", sub: `${w.rainChance}% chance` },
          { label: "Soil moisture", value: w.theme === "heat" ? "Low" : w.theme === "monsoon" ? "Saturated" : "Adequate", sub: w.theme === "heat" ? "Irrigate today" : "No irrigation" },
          { label: "Spray window", value: "6–11 AM", sub: "Calm winds" },
        ],
        chart: {
          kind: "rain-bars",
          slots: ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM", "3 AM"].map((t, i) => ({
            t,
            mm: w.theme === "monsoon" ? [6, 9, 14, 18, 12, 8, 5, 6][i] : w.theme === "heat" ? 0 : [0, 0, 1, 2, 6, 8, 3, 1][i],
          })),
        },
        items: [
          {
            icon: "Droplets",
            title: "Irrigation",
            body: w.theme === "heat" ? "Irrigate in early morning to reduce evaporation loss." : "Skip evening irrigation — showers expected after 4 PM.",
            tone: "info",
          },
          { icon: "Bug", title: "Pest watch", body: "Stem borer risk is high during humid spells. Scout paddy fields today.", tone: "warn" },
          { icon: "Wheat", title: "Field activity", body: "Good window for transplanting before the evening thunderstorm.", tone: "good" },
        ],
        footnote: "Source: Agro-Met Advisory · 6:10 AM",
      };
    case "student":
      return {
        icon: "GraduationCap",
        accent: "sky",
        title: "Commute Brief",
        subtitle: `${w.city} · College route`,
        metrics: [
          { label: "Leave by", value: w.theme === "monsoon" ? "7:50 AM" : "8:20 AM", sub: "To reach by 9" },
          { label: "Rain on route", value: w.rainChance > 60 ? "Very likely" : w.rainChance > 35 ? "Possible" : "Unlikely", sub: `${w.rainChance}% by 9 AM` },
          { label: "Evening", value: `${w.lo + 4}°`, sub: w.theme === "dusk" ? "Storm risk" : "Pleasant" },
        ],
        items: [
          { icon: "Umbrella", title: "Carry an umbrella", body: w.rainChance > 40 ? `Showers likely near campus around ${hourLabel(new Date().getHours() + 4)}.` : "Sky stays mostly dry — umbrella optional today.", tone: w.rainChance > 40 ? "info" : "good" },
          { icon: "Bus", title: "Transit", body: w.theme === "monsoon" ? `Expect 15–20 min delays on ${route} due to waterlogging.` : `Normal traffic expected on ${route} this morning.`, tone: w.theme === "monsoon" ? "warn" : "good" },
          { icon: "Backpack", title: "Pack smart", body: "Keep books in a waterproof sleeve; charge your phone fully tonight.", tone: "info" },
        ],
      };
    case "traveller":
      return {
        icon: "Plane",
        accent: "violet",
        title: "Travel Planner",
        subtitle: `${w.city} · Today`,
        metrics: [
          { label: "Best window", value: w.theme === "heat" ? "Before 10 AM" : w.theme === "monsoon" ? "Late evening" : "6–10 AM", sub: "Outdoor" },
          { label: "Rain risk", value: `${w.rainChance}%`, sub: w.rainChance > 50 ? "Plan backups" : "Mostly fine" },
          { label: "Day rating", value: w.theme === "heat" ? "4/10" : w.theme === "monsoon" ? "3/10" : "7/10", sub: "For sightseeing" },
        ],
        items: [
          { icon: "MapPin", title: "Sightseeing", body: `Visit ${landmark} before noon — light is softer and crowds thinner.`, tone: "good" },
          { icon: w.theme === "monsoon" ? "CloudRain" : w.theme === "heat" ? "ThermometerSun" : "CloudLightning", title: "Heads up", body: w.theme === "monsoon" ? "Showers through the day. Keep a cab buffer for the airport." : w.theme === "heat" ? "Extreme heat 12–4 PM — plan indoor museums then." : "Thunderstorms possible at dusk — finish outdoor plans by 5 PM.", tone: "warn" },
          { icon: "Luggage", title: "Pack", body: w.theme === "heat" ? "Cottons, sunscreen SPF 50+, ORS sachets." : w.theme === "monsoon" ? "Quick-dry clothes, rain cover, spare footwear." : "Light layers + a compact umbrella.", tone: "info" },
        ],
        footnote: "Curated from hyperlocal forecast · refreshed hourly",
      };
    case "fisherman": {
      const wave = waveOf(w);
      const state = seaStateOf(w);
      return {
        icon: "Fish",
        accent: "cyan",
        title: "Marine Forecast",
        subtitle: "Nearshore waters · 12 NM",
        metrics: [
          { label: "Wind", value: `${w.windKmh} km/h`, sub: `${w.gusts} km/h gusts` },
          { label: "Wave height", value: `${wave} m`, sub: state },
          { label: "Sea state", value: state, sub: w.theme === "monsoon" ? "Unsafe" : "Caution after 2 PM" },
        ],
        chart: { kind: "wind-compass", deg: w.windDeg, speed: w.windKmh, gusts: w.gusts },
        items: [
          { icon: "Waves", title: "Swell", body: w.theme === "monsoon" ? `Swell waves near ${wave} m. All vessels stay in harbour.` : "Swell rises after 2 PM — plan your return before noon.", tone: w.theme === "monsoon" ? "danger" : "warn" },
          { icon: "Wind", title: "Squalls", body: `Gusts touching ${w.gusts + 15} km/h in passing squalls over open water.`, tone: "warn" },
          { icon: "Anchor", title: "Tides", body: "High tide 9:42 AM · Low tide 4:05 PM. Best launch at first light.", tone: "info" },
        ],
        footnote: "Source: Ocean State Forecast · 5:30 AM",
      };
    }
    case "outdoor":
      return {
        icon: "HardHat",
        accent: "amber",
        title: "Worksite Safety",
        subtitle: "Shift planner · today",
        metrics: [
          { label: "Heat index", value: `${w.feels}°`, sub: w.feels > 40 ? "Danger" : "Caution" },
          { label: "UV index", value: `${w.uv}`, sub: w.uvLabel },
          { label: "Safe window", value: w.theme === "heat" ? "Before 11 AM" : "Till 4 PM", sub: "Heavy work" },
        ],
        chart: { kind: "heat-timeline", from: 6, to: 20, danger: w.theme === "heat" ? [11, 16] : [12, 15], peak: 15 },
        items: [
          { icon: "ThermometerSun", title: "Rest breaks", body: w.feels > 40 ? "Mandatory 15-min shade break every hour, 11 AM–4 PM." : "Schedule heavy lifting before noon.", tone: w.feels > 40 ? "danger" : "info" },
          { icon: "Droplets", title: "Hydration", body: "Drink ~250 ml water every hour even without thirst.", tone: "info" },
          { icon: "CloudLightning", title: "Lightning protocol", body: w.theme === "dusk" || w.theme === "monsoon" ? "Stop crane work and move indoors on first thunder — risk window 5–7 PM." : "Low storm risk today. Standard protocol applies.", tone: w.theme === "dusk" || w.theme === "monsoon" ? "warn" : "good" },
        ],
        footnote: "Aligned to heat-action guidance",
      };
    case "health":
      return {
        icon: "HeartPulse",
        accent: "rose",
        title: "Health brief",
        subtitle: `${w.city} · sensitivity-aware guidance`,
        metrics: [
          { label: "UV index", value: `${w.uv}`, sub: w.uvLabel },
          { label: "Humidity", value: `${w.humidity}%`, sub: w.humidity > 70 ? "May feel heavy" : "Comfortable" },
          { label: "Feels like", value: `${w.feels}°`, sub: w.feels > 38 ? "Heat caution" : "Moderate" },
        ],
        items: [
          { icon: "Wind", title: "Air quality", body: "AQI data is available when the air-quality provider is connected. Check current AQI before prolonged outdoor activity.", tone: "info" },
          { icon: "Sun", title: "UV protection", body: w.uv >= 8 ? "Very high UV: use SPF 30+, shade, and protective clothing." : w.uv >= 5 ? "Moderate-to-high UV: sunscreen and shade are recommended." : "Low-to-moderate UV conditions today.", tone: w.uv >= 8 ? "warn" : "good" },
          { icon: "Droplets", title: "Humidity", body: w.humidity > 70 ? "High humidity may aggravate breathing discomfort and skin irritation. Keep cool and hydrated." : "Humidity is in a generally comfortable range.", tone: w.humidity > 70 ? "warn" : "good" },
          { icon: "Leaf", title: "Pollen", body: "Pollen readings are not configured for this deployment.", tone: "info" },
        ],
        footnote: "General wellness guidance · not medical advice",
      };
    case "parent":
      return {
        icon: "Users",
        accent: "amber",
        title: "Family brief",
        subtitle: `${w.city} · school-day planning`,
        metrics: [
          { label: "Morning", value: w.rainChance > 60 ? "Wet" : "Good", sub: `${w.rainChance}% rain chance` },
          { label: "Visibility", value: `${w.vis} km`, sub: w.vis < 5 ? "Use caution" : "Good" },
          { label: "Feels like", value: `${w.feels}°`, sub: w.feels > 38 ? "Heat caution" : "Comfortable" },
        ],
        items: [
          { icon: "Umbrella", title: "School commute", body: w.rainChance > 60 ? "Rain is likely around commute hours. Pack rain protection and allow extra time." : "Mostly manageable school commute conditions this morning.", tone: w.rainChance > 60 ? "warn" : "good" },
          { icon: "Eye", title: "Visibility", body: w.vis < 5 ? "Reduced visibility may affect school transport. Confirm the route before leaving." : "Visibility is good for the morning commute.", tone: w.vis < 5 ? "warn" : "good" },
          { icon: "ThermometerSun", title: "Heat safety", body: w.feels > 38 ? "Send water and avoid prolonged midday outdoor activity." : "No significant heat stress expected during the school day.", tone: w.feels > 38 ? "warn" : "info" },
          { icon: "AlertTriangle", title: "Severe weather", body: w.theme === "monsoon" ? "Keep children indoors during lightning or very heavy rain." : "No severe weather warning for the current forecast.", tone: w.theme === "monsoon" ? "danger" : "good" },
        ],
        footnote: "Family planning guidance · check local school notices",
      };
    case "event": {
      const comfort = w.rainChance > 60 || w.feels > 38 || w.windKmh > 30 ? "Low" : w.rainChance > 35 || w.feels > 32 ? "Fair" : "Good";
      return {
        icon: "CalendarDays",
        accent: "violet",
        title: "Event planner",
        subtitle: `${w.city} · outdoor planning`,
        metrics: [
          { label: "Comfort", value: comfort, sub: "Outdoor score" },
          { label: "Rain risk", value: `${w.rainChance}%`, sub: w.rainChance > 50 ? "Have a backup" : "Manageable" },
          { label: "Best window", value: w.theme === "heat" ? "Before 10 AM" : w.theme === "monsoon" ? "After 7 PM" : "6–10 AM", sub: "Outdoor" },
        ],
        items: [
          { icon: "CloudRain", title: "Rain plan", body: w.rainChance > 50 ? "Keep a covered venue or rain backup ready for the event." : "Low rain risk supports an outdoor setup.", tone: w.rainChance > 50 ? "warn" : "good" },
          { icon: "ThermometerSun", title: "Guest comfort", body: w.feels > 38 ? "Provide shade, water, and cooling stations; avoid the afternoon peak." : "Temperature should be comfortable for most guests.", tone: w.feels > 38 ? "warn" : "good" },
          { icon: "Wind", title: "Wind", body: w.windKmh > 30 ? `Wind near ${w.windKmh} km/h may affect decor and temporary structures.` : `Wind near ${w.windKmh} km/h is suitable for normal outdoor setup.`, tone: w.windKmh > 30 ? "warn" : "info" },
          { icon: "CalendarDays", title: "Planning note", body: "Confirm the forecast again 24 hours before the event.", tone: "info" },
        ],
        footnote: "Planning guidance · weather can change quickly",
      };
    }
    default:
      return {
        icon: "Sparkles",
        accent: "rose",
        title: "Your Day, Weatherwise",
        subtitle: `${w.city} · Lifestyle`,
        metrics: [
          { label: "Outdoor", value: w.theme === "heat" || w.theme === "monsoon" ? "Poor" : "Good", sub: w.theme === "cloud" ? "8/10" : "6/10" },
          { label: "Umbrella", value: w.rainChance > 40 ? "Carry" : "Optional", sub: `${w.rainChance}% rain` },
          { label: "Evening", value: `${w.lo + 3}°`, sub: w.theme === "marine" ? "Breezy" : "Mild" },
        ],
        items: [
          { icon: "Shirt", title: "Laundry", body: w.theme === "monsoon" ? "Dry clothes indoors — rain bands all day." : "Clothes dry fast if hung before 2 PM.", tone: "info" },
          { icon: "Bike", title: "Exercise", body: w.theme === "heat" ? "Work out indoors after 9 AM — heat stress risk outside." : "Great morning for a ride or a run before 9 AM.", tone: "good" },
          { icon: "Umbrella", title: "Rain check", body: w.rainChance > 50 ? "Downpour likely later — zip up windows before leaving." : "Only a slight drizzle chance towards late evening.", tone: w.rainChance > 50 ? "warn" : "info" },
        ],
      };
  }
}

/* ----------------------------- metrics ----------------------------- */

function buildMetrics(w: LocationWeather): MetricsProps {
  return {
    title: "Weather details",
    metrics: [
      { id: "wind", icon: "Wind", label: "Wind", value: `${w.windKmh}`, unit: "km/h", sub: `Gusts ${w.gusts}`, gauge: { kind: "compass", deg: w.windDeg } },
      { id: "humidity", icon: "Droplets", label: "Humidity", value: `${w.humidity}`, unit: "%", sub: w.humidity > 70 ? "Sticky" : "Comfortable", gauge: { kind: "ring", pct: w.humidity / 100, tint: "#38bdf8" } },
      { id: "uv", icon: "Sun", label: "UV index", value: `${w.uv}`, sub: w.uvLabel, gauge: { kind: "uv", value: Math.min(w.uv, 11), max: 11 } },
      { id: "pressure", icon: "Navigation", label: "Pressure", value: `${w.pressure}`, unit: "hPa", sub: w.pressure < 1005 ? "Falling" : "Steady", gauge: { kind: "ring", pct: Math.min(1, Math.max(0, (w.pressure - 960) / 90)), tint: "#a78bfa" } },
      { id: "visibility", icon: "Eye", label: "Visibility", value: `${w.vis}`, unit: "km", sub: w.visNote },
      { id: "sun", icon: "Sunrise", label: "Sun cycle", value: w.sunrise, sub: `Sunset ${w.sunset}`, gauge: { kind: "sunpath", sunrise: w.sunrise, sunset: w.sunset } },
    ],
  };
}

/* ------------------------------ hero ------------------------------ */

const PERSONA_SUMMARY: Partial<Record<PersonaId, (w: LocationWeather) => string>> = {
  farmer: (w) =>
    w.theme === "heat"
      ? "Hot, dry spell. Irrigate early morning; mulch to hold soil moisture."
      : w.theme === "monsoon"
        ? "Wet spell ahead — hold off sowing and secure harvested produce."
        : "Humid morning. Light showers late in the day — finish spraying before noon.",
  fisherman: (w) =>
    w.theme === "monsoon"
      ? `Sea rough with ${waveOf(w)} m swell. Harbour advisory in force.`
      : `Moderate ${w.windKmh} km/h breeze. Sea gets choppy after noon.`,
  student: (w) =>
    w.rainChance > 50 ? "Carry an umbrella — rain likely around college hours." : "Dry commute this morning. Light evening breeze expected.",
  traveller: (w) =>
    w.theme === "heat" ? "Sightsee before 10 AM; the afternoon is for indoor plans." : "Postcard morning ahead. Keep evenings flexible for showers.",
  health: (w) => w.uv >= 8 ? "Very high UV today. Protect exposed skin and plan outdoor time around shade." : "Check air quality before extended outdoor activity; hydration and shade remain sensible.",
  parent: (w) => w.rainChance > 60 ? "Rain is likely around school commute hours. Pack rain protection and leave extra time." : "School commute conditions look manageable this morning.",
  event: (w) => w.rainChance > 50 ? "Keep a rain backup ready; outdoor comfort improves outside the wettest window." : "Conditions support an outdoor event, with the morning offering the most comfortable window.",
  outdoor: (w) =>
    w.feels > 40 ? "Dangerous heat index. Front-load heavy work before 11 AM." : "Manageable morning. Storm risk rises late — wrap up by 5 PM.",
};

function buildHero(persona: PersonaId, w: LocationWeather): HeroProps {
  return {
    temperature: w.temp,
    feelsLike: w.feels,
    condition: w.condition,
    icon: w.icon,
    hi: w.hi,
    lo: w.lo,
    locationLabel: `${w.city}${w.state ? `, ${w.state}` : ""}`,
    summary: (PERSONA_SUMMARY[persona]?.(w) ?? w.summary),
    stats: [
      { icon: "Wind", label: "Wind", value: `${w.windKmh} km/h` },
      { icon: "Droplets", label: "Humidity", value: `${w.humidity}%` },
      { icon: "CloudRain", label: "Rain", value: `${w.rainChance}%` },
    ],
  };
}

function buildLocationSection(w: LocationWeather): LocationSectionProps {
  return {
    title: "Locations",
    gpsEnabled: true,
    current: { city: w.city, state: w.state, label: `${w.lat.toFixed(2)}° N · ${w.lon.toFixed(2)}° E` },
    saved: Object.values(LOCATIONS).map((l) => ({ id: l.id, city: l.city, state: l.state, icon: "MapPin" })),
  };
}

/* ------------------------- layout per persona ---------------------- */

function buildComponents(persona: PersonaId, w: LocationWeather): SDUIComponentNode[] {
  const alerts = buildAlerts(persona, w);
  const alertNodes: SDUIComponentNode[] = alerts.map((a, i) => ({ id: `alert-${i}`, type: "WeatherAlert", props: a as unknown as Record<string, unknown> }));
  const hero: SDUIComponentNode = { id: "hero", type: "WeatherHero", props: buildHero(persona, w) as unknown as Record<string, unknown> };
  const hourly: SDUIComponentNode = { id: "hourly", type: "HourlyForecast", props: buildHourly(w) as unknown as Record<string, unknown> };
  const daily: SDUIComponentNode = { id: "daily", type: "DailyForecast", props: buildDaily(w) as unknown as Record<string, unknown> };
  const advisory: SDUIComponentNode = { id: "advisory", type: "Advisory", props: buildAdvisory(persona, w) as unknown as Record<string, unknown> };
  const metrics: SDUIComponentNode = { id: "metrics", type: "MetricsGrid", props: buildMetrics(w) as unknown as Record<string, unknown> };
  const locations: SDUIComponentNode = { id: "locations", type: "LocationSection", props: buildLocationSection(w) as unknown as Record<string, unknown> };

  switch (persona) {
    case "farmer":
      return [...(alertNodes.length ? [alertNodes[0], hero] : [hero]), advisory, hourly, daily, ...alertNodes.slice(1), metrics, locations];
    case "fisherman":
      return [hero, ...alertNodes, advisory, hourly, metrics, daily, locations];
    case "outdoor":
      return [...alertNodes, hero, advisory, hourly, metrics, daily, locations];
    case "student":
      return [hero, advisory, hourly, ...alertNodes, metrics, daily, locations];
    case "traveller":
      return [hero, ...alertNodes, advisory, hourly, daily, metrics, locations];
    default:
      return [hero, hourly, ...alertNodes, metrics, advisory, daily, locations];
  }
}

function buildPayload(persona: PersonaId, w: LocationWeather): SDUIPayload {
  return {
    version: "1.0",
    persona,
    location: { id: w.id, city: w.city, state: w.state, label: w.state ? `${w.city}, ${w.state}` : w.city, lat: w.lat, lon: w.lon },
    theme: w.theme,
    generatedAt: new Date().toISOString(),
    components: buildComponents(persona, w),
  };
}

/* ------------------------------------------------------------------ */
/* Mock transport                                                      */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  code: "OFFLINE" | "TIMEOUT" | "SERVER";
  constructor(code: "OFFLINE" | "TIMEOUT" | "SERVER", message: string) {
    super(message);
    this.code = code;
  }
}

const latency = () => 750 + Math.random() * 850;

/**
 * Fetch the SDUI home payload.
 * `location` may be a preset id (string) or a full LocationMeta from search.
 * Presets resolve instantly from curated mock data; any other location is
 * resolved against the live provider — mirroring the Fastify upstream call.
 */
export function mockFetchHome(
  persona: PersonaId,
  location: string | LocationMeta,
  offline: boolean,
  signal?: AbortSignal
): Promise<SDUIPayload> {
  const presetId = typeof location === "string" ? location : null;
  const preset = presetId ? LOCATIONS[presetId] : null;

  if (preset) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (offline) reject(new ApiError("OFFLINE", "Mausam servers unreachable"));
        else resolve(buildPayload(persona, preset));
      }, latency());
    });
  }

  return (async () => {
    if (offline) throw new ApiError("OFFLINE", "Mausam servers unreachable");
    const meta: LocationMeta =
      typeof location === "string"
        ? { id: location, city: location, state: "", label: location, lat: 22.57, lon: 88.36 }
        : location;
    const weather = await buildLiveWeather(meta, signal);
    return buildPayload(persona, weather);
  })();
}

export function mockUpdatePersona(persona: PersonaId, offline: boolean): Promise<{ ok: true; persona: PersonaId }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (offline) reject(new ApiError("OFFLINE", "Persona sync queued locally"));
      else resolve({ ok: true, persona });
    }, 420);
  });
}
