import { readMetricsCache, writeMetricsCache } from './metricsCache';

export interface RawMetrics {
  aqi: number;
  weatherTempC: number;
  humidityPct: number;
  uvIndex: number;
  visibilityKm: number;
  rainChancePct: number;
  soilMoisture: number | null;
  sunrise: string | null;
  sunset: string | null;
  waveHeightM: number | null;
  waveDirectionDeg: number | null;
  wavePeriodS: number | null;
  waterTemperatureC: number | null;
  tides: TideExtreme[];
  traffic: TrafficMetrics | null;
  routeConfigured: boolean;
  pollen: PollenMetrics | null;
  hourly: HourPoint[];
  daily: DayPoint[];
  timestamp: string;
}

export interface HourPoint {
  t: string;
  icon: string;
  temp: number;
  precip: number;
}

export interface DayPoint {
  d: string;
  icon: string;
  hi: number;
  lo: number;
  precip: number;
}

export interface TideExtreme {
  type: 'high' | 'low';
  time: string;
  heightM: number;
}

async function readJson(url: string): Promise<Record<string, any>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Upstream request failed (${response.status})`);
  return response.json() as Promise<Record<string, any>>;
}

async function readTides(lat: number, lon: number): Promise<TideExtreme[]> {
  const key = process.env.WORLDTIDES_API_KEY;
  if (!key) return [];

  const tidesUrl = new URL('https://www.worldtides.info/api/v3');
  tidesUrl.search = new URLSearchParams({
    extremes: '',
    lat: String(lat),
    lon: String(lon),
    days: '1',
    key,
  }).toString();

  try {
    const data = await readJson(tidesUrl.toString());
    if (!Array.isArray(data.extremes)) return [];
    return data.extremes
      .filter((item: any) => (item?.type === 'High' || item?.type === 'Low') && typeof item?.dt === 'number' && typeof item?.height === 'number')
      .slice(0, 4)
      .map((item: any) => ({
        type: item.type === 'High' ? 'high' : 'low',
        time: new Date(item.dt * 1000).toISOString(),
        heightM: Math.round(item.height * 100) / 100,
      }));
  } catch {
    return [];
  }
}

async function readTraffic(route?: RouteCoordinates): Promise<TrafficMetrics | null> {
  const key = process.env.TOMTOM_API_KEY;
  if (!key || !route) return null;

  const routeUrl = new URL(
    `https://api.tomtom.com/routing/1/calculateRoute/${route.originLat},${route.originLon}:${route.destinationLat},${route.destinationLon}/json`
  );
  routeUrl.search = new URLSearchParams({ key, traffic: 'true', travelMode: 'car' }).toString();

  try {
    const data = await readJson(routeUrl.toString());
    const summary = data.routes?.[0]?.summary;
    if (!summary || typeof summary.travelTimeInSeconds !== 'number' || typeof summary.trafficDelayInSeconds !== 'number') {
      console.error('[traffic] TomTom response missing route summary:', {
        keys: Object.keys(data),
        routeCount: Array.isArray(data.routes) ? data.routes.length : 0,
        summaryKeys: data.routes?.[0]?.summary ? Object.keys(data.routes[0].summary) : [],
        error: data.error ?? data.detailedError,
      });
      return null;
    }
    return {
      delayMin: Math.max(0, Math.round(summary.trafficDelayInSeconds / 60)),
      travelMin: Math.max(0, Math.round(summary.travelTimeInSeconds / 60)),
      freeFlowMin: Math.max(0, Math.round((summary.travelTimeInSeconds - summary.trafficDelayInSeconds) / 60)),
    };
  } catch (error) {
    console.error('[traffic] TomTom request failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

function readPollen(data: Record<string, any> | null): PollenMetrics | null {
  const pollenNames = [
    ['grass', 'grass_pollen'],
    ['birch', 'birch_pollen'],
    ['alder', 'alder_pollen'],
    ['olive', 'olive_pollen'],
    ['ragweed', 'ragweed_pollen'],
    ['mugwort', 'mugwort_pollen'],
  ] as const;
  const readings = pollenNames
    .map(([name, key]) => ({ name, value: data?.hourly?.[key]?.[0] }))
    .filter((reading) => typeof reading.value === 'number') as Array<{ name: string; value: number }>;
  if (!readings.length) return null;
  const dominant = readings.reduce((highest, reading) => reading.value > highest.value ? reading : highest);
  const level = dominant.value >= 100 ? 'very high' : dominant.value >= 50 ? 'high' : dominant.value >= 10 ? 'moderate' : 'low';
  return { dominant: dominant.name, value: Math.round(dominant.value), level };
}

async function fetchAggregatedMetrics(lat: number, lon: number, route?: RouteCoordinates): Promise<RawMetrics> {
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,visibility,weather_code',
    hourly: 'temperature_2m,soil_moisture_0_to_7cm,precipitation_probability,weather_code',
    daily: 'uv_index_max,precipitation_probability_max,sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min',
    forecast_days: '7',
    timezone: 'auto',
  }).toString();

  const airQualityUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airQualityUrl.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'us_aqi,pm2_5',
    hourly: 'alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen',
    timezone: 'auto',
  }).toString();

  const marineUrl = new URL('https://marine-api.open-meteo.com/v1/marine');
  marineUrl.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'wave_height,wave_direction,wave_period,sea_surface_temperature',
    timezone: 'auto',
  }).toString();

  const [weather, airQuality, marine] = await Promise.allSettled([
    readJson(weatherUrl.toString()),
    readJson(airQualityUrl.toString()),
    readJson(marineUrl.toString()),
  ]);
  const weatherData = weather.status === 'fulfilled' ? weather.value : null;
  const airQualityData = airQuality.status === 'fulfilled' ? airQuality.value : null;
  const marineData = marine.status === 'fulfilled' ? marine.value : null;
  const current = weatherData?.current;
  const daily = weatherData?.daily;
  const hourly = weatherData?.hourly;
  const marineCurrent = marineData?.current;
  const tides = await readTides(lat, lon);
  const traffic = await readTraffic(route);
  const pollen = readPollen(airQualityData);
  const hourlyForecast: HourPoint[] = (hourly?.time ?? []).slice(0, 12).map((time: string, index: number) => ({
    t: index === 0 ? 'Now' : new Intl.DateTimeFormat('en-IN', { hour: 'numeric' }).format(new Date(time)),
    icon: weatherIcon(hourly?.weather_code?.[index] ?? 3),
    temp: Math.round(hourly?.temperature_2m?.[index] ?? current?.temperature_2m ?? 29),
    precip: Math.round(hourly?.precipitation_probability?.[index] ?? 0),
  }));
  const dailyForecast: DayPoint[] = (daily?.time ?? []).slice(0, 7).map((date: string, index: number) => ({
    d: index === 0 ? 'Today' : new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(new Date(`${date}T12:00:00`)),
    icon: weatherIcon(daily?.weather_code?.[index] ?? 3),
    hi: Math.round(daily?.temperature_2m_max?.[index] ?? current?.temperature_2m ?? 29),
    lo: Math.round(daily?.temperature_2m_min?.[index] ?? current?.temperature_2m ?? 29),
    precip: Math.round(daily?.precipitation_probability_max?.[index] ?? 0),
  }));

  return {
    aqi: typeof airQualityData?.current?.us_aqi === 'number' ? Math.round(airQualityData.current.us_aqi) : 82,
    weatherTempC: typeof current?.temperature_2m === 'number' ? Math.round(current.temperature_2m) : 29,
    humidityPct: typeof current?.relative_humidity_2m === 'number' ? Math.round(current.relative_humidity_2m) : 60,
    uvIndex: typeof daily?.uv_index_max?.[0] === 'number' ? Math.round(daily.uv_index_max[0] * 10) / 10 : 5,
    visibilityKm: typeof current?.visibility === 'number' ? Math.round(current.visibility / 100) / 10 : 10,
    rainChancePct: typeof daily?.precipitation_probability_max?.[0] === 'number' ? Math.round(daily.precipitation_probability_max[0]) : 20,
    soilMoisture: typeof hourly?.soil_moisture_0_to_7cm?.[0] === 'number' ? hourly.soil_moisture_0_to_7cm[0] : null,
    sunrise: typeof daily?.sunrise?.[0] === 'string' ? daily.sunrise[0] : null,
    sunset: typeof daily?.sunset?.[0] === 'string' ? daily.sunset[0] : null,
    waveHeightM: typeof marineCurrent?.wave_height === 'number' ? marineCurrent.wave_height : null,
    waveDirectionDeg: typeof marineCurrent?.wave_direction === 'number' ? marineCurrent.wave_direction : null,
    wavePeriodS: typeof marineCurrent?.wave_period === 'number' ? marineCurrent.wave_period : null,
    waterTemperatureC: typeof marineCurrent?.sea_surface_temperature === 'number' ? marineCurrent.sea_surface_temperature : null,
    tides,
    traffic,
    routeConfigured: route !== undefined,
    pollen,
    hourly: hourlyForecast,
    daily: dailyForecast,
    timestamp: new Date().toISOString(),
  };
}

export async function getAggregatedMetrics(lat: number, lon: number, route?: RouteCoordinates): Promise<RawMetrics> {
  const cached = await readMetricsCache(lat, lon, route);
  if (cached) return cached;

  const metrics = await fetchAggregatedMetrics(lat, lon, route);
  await writeMetricsCache(lat, lon, metrics, route);
  return metrics;
}

export interface TrafficMetrics {
  delayMin: number;
  travelMin: number;
  freeFlowMin: number;
}

export interface RouteCoordinates {
  originLat: number;
  originLon: number;
  destinationLat: number;
  destinationLon: number;
}

export interface PollenMetrics {
  dominant: string;
  value: number;
  level: 'low' | 'moderate' | 'high' | 'very high';
}

function weatherIcon(code: number): string {
  if (code >= 95) return 'CloudLightning';
  if (code >= 61 || (code >= 80 && code <= 82)) return 'CloudRain';
  if (code >= 51) return 'CloudDrizzle';
  if (code === 0 || code === 1) return 'Sun';
  if (code === 2) return 'CloudSun';
  return 'Cloudy';
}

export interface PlaceSearchResult {
  id: string;
  city: string;
  state: string;
  label: string;
  lat: number;
  lon: number;
}

export async function searchPlaces(query: string, lat?: number, lon?: number, nearby = true): Promise<PlaceSearchResult[]> {
  const key = process.env.TOMTOM_API_KEY;
  if (!key || query.trim().length < 2) return [];

  const searchUrl = new URL(`https://api.tomtom.com/search/2/search/${encodeURIComponent(query.trim())}.json`);
  searchUrl.search = new URLSearchParams({
    key,
    limit: '8',
    language: 'en-US',
    ...(nearby && Number.isFinite(lat) && Number.isFinite(lon) ? { lat: String(lat), lon: String(lon), radius: '50000' } : {}),
  }).toString();

  try {
    const data = await readJson(searchUrl.toString());
    if (!Array.isArray(data.results)) return [];
    return data.results
      .filter((result: any) => typeof result?.position?.lat === 'number' && typeof result?.position?.lon === 'number')
      .map((result: any, index: number) => ({
        id: `poi-${result.id ?? index}`,
        city: result.poi?.name ?? result.address?.freeformAddress ?? query.trim(),
        state: result.address?.municipalitySubdivision ?? result.address?.municipality ?? '',
        label: result.address?.freeformAddress ?? result.poi?.name ?? query.trim(),
        lat: result.position.lat,
        lon: result.position.lon,
      }));
  } catch (error) {
    console.error('[places] TomTom search failed:', error instanceof Error ? error.message : error);
    return [];
  }
}