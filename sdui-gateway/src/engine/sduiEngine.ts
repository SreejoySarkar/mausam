import { RawMetrics } from '../services/dataAggregator';
import type { TravelProviderResult } from '../services/travelProviders';

type PersonaId = 'general' | 'farmer' | 'student' | 'traveller' | 'fisherman' | 'outdoor' | 'health' | 'parent' | 'event';

interface LocationMeta {
  id: string;
  city: string;
  state: string;
  label: string;
  lat: number;
  lon: number;
}

interface SduiPayload {
  version: string;
  persona: PersonaId;
  location: LocationMeta;
  theme: 'dusk' | 'monsoon' | 'heat' | 'marine' | 'cloud';
  generatedAt: string;
  components: Array<{ id: string; type: string; props: Record<string, unknown> }>;
}

const QUICK_LOCATIONS = [
  { id: 'kolkata', city: 'Kolkata', state: 'West Bengal', icon: 'MapPin' },
  { id: 'mumbai', city: 'Mumbai', state: 'Maharashtra', icon: 'MapPin' },
  { id: 'delhi', city: 'New Delhi', state: 'Delhi NCR', icon: 'MapPin' },
  { id: 'chennai', city: 'Chennai', state: 'Tamil Nadu', icon: 'MapPin' },
  { id: 'bengaluru', city: 'Bengaluru', state: 'Karnataka', icon: 'MapPin' },
];

function normalizePersona(profile: string): PersonaId {
  const value = profile.toLowerCase();
  if (['farmer', 'student', 'traveller', 'fisherman', 'outdoor', 'health', 'parent', 'event'].includes(value)) return value as PersonaId;
  return 'general';
}

function seaState(waveHeightM: number): string {
  if (waveHeightM < 0.5) return 'Calm';
  if (waveHeightM < 1.25) return 'Slight';
  if (waveHeightM < 2.5) return 'Moderate';
  return 'Rough';
}

function formatTideTime(isoTime: string): string {
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(isoTime));
}

function healthAdvice(metrics: RawMetrics): Array<Record<string, string>> {
  return [
    { icon: 'Wind', title: 'Air quality', body: `Current AQI is ${metrics.aqi}. ${metrics.aqi >= 150 ? 'Limit prolonged outdoor exertion.' : metrics.aqi >= 100 ? 'Sensitive groups should consider reducing prolonged outdoor activity.' : 'Conditions are generally acceptable for most people.'}`, tone: metrics.aqi >= 150 ? 'danger' : metrics.aqi >= 100 ? 'warn' : 'good' },
    { icon: 'Sun', title: 'UV protection', body: metrics.uvIndex >= 8 ? 'Very high UV: use SPF 30+, shade, and protective clothing.' : metrics.uvIndex >= 5 ? 'Moderate-to-high UV: sunscreen and shade are recommended.' : 'Low-to-moderate UV conditions today.', tone: metrics.uvIndex >= 8 ? 'warn' : 'good' },
    { icon: 'HeartPulse', title: 'Pollen', body: metrics.pollen ? `${metrics.pollen.dominant} pollen is ${metrics.pollen.level} (${metrics.pollen.value}). Consider a mask or indoor exercise if symptoms are triggered.` : 'Pollen readings are not available for this location.', tone: metrics.pollen?.level === 'high' || metrics.pollen?.level === 'very high' ? 'warn' : 'info' },
  ];
}

function parentAdvice(metrics: RawMetrics): Array<Record<string, string>> {
  return [
    { icon: 'Umbrella', title: 'School commute', body: metrics.rainChancePct >= 60 ? `Rain probability is ${metrics.rainChancePct}%. Pack rain protection and allow extra time.` : 'School commute conditions look manageable this morning.', tone: metrics.rainChancePct >= 60 ? 'warn' : 'good' },
    { icon: 'Eye', title: 'Visibility', body: metrics.visibilityKm < 5 ? `Visibility is ${metrics.visibilityKm} km. Confirm the school transport route before leaving.` : 'Visibility is good for the morning commute.', tone: metrics.visibilityKm < 5 ? 'warn' : 'good' },
    { icon: 'ThermometerSun', title: 'Heat safety', body: metrics.weatherTempC >= 38 ? 'Send water and avoid prolonged midday outdoor activity.' : 'No significant heat stress expected during the school day.', tone: metrics.weatherTempC >= 38 ? 'warn' : 'info' },
    { icon: 'AlertTriangle', title: 'Severe weather', body: metrics.rainChancePct >= 85 ? 'Keep children indoors during very heavy rain or lightning.' : 'No severe weather warning for the current forecast.', tone: metrics.rainChancePct >= 85 ? 'danger' : 'good' },
  ];
}

function farmerAdvice(metrics: RawMetrics): Array<Record<string, string>> {
  return [
    { icon: 'Droplets', title: 'Soil moisture', body: metrics.soilMoisture === null ? 'Soil moisture readings are not available for this location.' : `Soil moisture is ${Math.round(metrics.soilMoisture * 100)}%. ${metrics.soilMoisture < 0.2 ? 'Plan irrigation early morning.' : metrics.soilMoisture > 0.6 ? 'Soil is wet; skip irrigation for now.' : 'Moisture is in a workable range.'}`, tone: metrics.soilMoisture === null ? 'info' : metrics.soilMoisture < 0.2 || metrics.soilMoisture > 0.6 ? 'warn' : 'good' },
    { icon: 'CloudRain', title: 'Rain planning', body: metrics.rainChancePct >= 60 ? `Rain probability is ${metrics.rainChancePct}%. Delay spraying and protect harvested produce.` : 'Low rain risk supports field activity and spraying.', tone: metrics.rainChancePct >= 60 ? 'warn' : 'good' },
    { icon: 'Sun', title: 'Crop stress', body: metrics.weatherTempC >= 38 || metrics.uvIndex >= 8 ? 'Heat and UV are elevated. Schedule heavy field work before midday.' : 'No major heat stress signal in the current forecast.', tone: metrics.weatherTempC >= 38 || metrics.uvIndex >= 8 ? 'warn' : 'info' },
    { icon: 'Sprout', title: 'Field note', body: 'Use local crop and soil guidance before making irrigation or treatment decisions.', tone: 'info' },
  ];
}

function eventAdvice(metrics: RawMetrics): Array<Record<string, string>> {
  const comfort = metrics.rainChancePct >= 60 || metrics.weatherTempC >= 38 || (metrics.traffic?.delayMin ?? 0) > 30 ? 'Low' : metrics.rainChancePct >= 35 || metrics.weatherTempC >= 32 ? 'Fair' : 'Good';
  return [
    { icon: 'CalendarDays', title: 'Comfort index', body: `Outdoor comfort is ${comfort}. Rain ${metrics.rainChancePct}%, temperature ${metrics.weatherTempC}°C, humidity ${metrics.humidityPct}%.`, tone: comfort === 'Low' ? 'warn' : comfort === 'Fair' ? 'info' : 'good' },
    { icon: 'CloudRain', title: 'Rain plan', body: metrics.rainChancePct > 50 ? 'Keep a covered venue or rain backup ready for the event.' : 'Low rain risk supports an outdoor setup.', tone: metrics.rainChancePct > 50 ? 'warn' : 'good' },
    { icon: 'ThermometerSun', title: 'Guest comfort', body: metrics.weatherTempC >= 38 ? 'Provide shade, water, and cooling stations; avoid the afternoon peak.' : 'Temperature should be comfortable for most guests.', tone: metrics.weatherTempC >= 38 ? 'warn' : 'good' },
    { icon: 'Wind', title: 'Setup conditions', body: 'Confirm wind and rain again 24 hours before the event.', tone: 'info' },
  ];
}

export function generateSDUILayout(profile: string, metrics: RawMetrics, location: LocationMeta, travelType?: 'domestic' | 'international', travelMode?: 'flight' | 'bus' | 'train', travelResults?: TravelProviderResult[]): SduiPayload {
  const persona = normalizePersona(profile);
  const temperature = Math.round(metrics.weatherTempC);
  const commonMetrics = [
    { id: 'aqi', icon: 'Wind', label: 'Air quality', value: `${metrics.aqi}`, sub: 'AQI' },
    { id: 'temperature', icon: 'Thermometer', label: 'Temperature', value: `${temperature}`, unit: 'C' },
    { id: 'humidity', icon: 'Droplets', label: 'Humidity', value: `${metrics.humidityPct}`, unit: '%' },
    { id: 'uv', icon: 'Sun', label: 'UV index', value: `${metrics.uvIndex}` },
    { id: 'visibility', icon: 'Eye', label: 'Visibility', value: `${metrics.visibilityKm}`, unit: 'km' },
    { id: 'rain', icon: 'CloudRain', label: 'Rain chance', value: `${metrics.rainChancePct}`, unit: '%' },
    ...(metrics.soilMoisture === null ? [] : [{ id: 'soil', icon: 'Sprout', label: 'Soil moisture', value: `${Math.round(metrics.soilMoisture * 100)}`, unit: '%' }]),
    ...(persona === 'student' ? [{
      id: 'traffic',
      icon: 'Car',
      label: 'Traffic',
      value: metrics.traffic ? `${metrics.traffic.delayMin}` : metrics.routeConfigured ? 'Unavailable' : 'Set route',
      unit: metrics.traffic ? 'min' : undefined,
      sub: metrics.traffic ? `${metrics.traffic.travelMin} min total` : metrics.routeConfigured ? 'Traffic provider unavailable' : 'Choose a commute destination',
    }] : metrics.traffic === null ? [] : [{ id: 'traffic', icon: 'Car', label: 'Traffic delay', value: `${metrics.traffic.delayMin}`, unit: 'min', sub: `${metrics.traffic.travelMin} min total` }]),
  ];
  const personaMetrics = {
    health: ['aqi', 'uv', 'humidity', 'visibility', 'temperature'],
    parent: ['rain', 'visibility', 'temperature', 'humidity', 'uv'],
    event: ['rain', 'temperature', 'humidity', 'visibility', 'uv'],
    farmer: ['rain', 'soil', 'humidity', 'temperature', 'uv'],
    fisherman: ['waves', 'water', 'humidity', 'visibility', 'rain'],
    student: ['traffic', 'rain', 'visibility', 'temperature', 'humidity'],
    traveller: ['visibility', 'rain', 'temperature', 'humidity', 'uv'],
    outdoor: ['temperature', 'uv', 'humidity', 'rain', 'visibility'],
    general: ['temperature', 'rain', 'humidity', 'visibility', 'aqi'],
  } as const;
  const priority = new Set<string>(personaMetrics[persona]);
  const metricItems = [
    ...commonMetrics.filter((metric) => priority.has(metric.id)),
    ...(persona !== 'fisherman' || metrics.waveHeightM === null ? [] : [
      { id: 'waves', icon: 'Waves', label: 'Wave height', value: metrics.waveHeightM.toFixed(1), unit: 'm' },
      ...(metrics.waterTemperatureC === null ? [] : [{ id: 'water', icon: 'Thermometer', label: 'Water temperature', value: metrics.waterTemperatureC.toFixed(1), unit: 'C' }]),
    ]),
  ];
  const generalAdvice: Array<Record<string, string>> = [
    { icon: 'Wind', title: 'Air quality', body: `Current AQI is ${metrics.aqi}.`, tone: metrics.aqi >= 150 ? 'danger' : metrics.aqi >= 100 ? 'warn' : 'good' },
    { icon: 'Eye', title: 'Visibility', body: `${metrics.visibilityKm} km visibility at the latest reading.`, tone: metrics.visibilityKm < 4 ? 'warn' : 'good' },
    ...(persona === 'student' ? [{
      icon: 'Car',
      title: 'Traffic route',
      body: metrics.traffic ? `${metrics.traffic.delayMin} min delay on the route (${metrics.traffic.travelMin} min total).` : metrics.routeConfigured ? 'Your route is saved, but live traffic is unavailable. Configure TOMTOM_API_KEY in the gateway.' : 'Set a commute route to see live delays.',
      tone: metrics.traffic ? metrics.traffic.delayMin >= 20 ? 'danger' : metrics.traffic.delayMin >= 8 ? 'warn' : 'good' : 'info',
    }] : []),
    ...(persona !== 'fisherman' || metrics.waveHeightM === null ? [] : [
      { icon: 'Waves', title: 'Marine conditions', body: `${seaState(metrics.waveHeightM)} sea with ${metrics.waveHeightM.toFixed(1)} m waves${metrics.wavePeriodS === null ? '.' : ` and a ${metrics.wavePeriodS.toFixed(1)} s period.`}`, tone: metrics.waveHeightM >= 2.5 ? 'danger' : metrics.waveHeightM >= 1.25 ? 'warn' : 'good' },
      { icon: 'Anchor', title: 'Tides', body: metrics.tides.length ? metrics.tides.map((tide) => `${tide.type === 'high' ? 'High' : 'Low'} ${formatTideTime(tide.time)} · ${tide.heightM.toFixed(2)} m`).join(' | ') : 'Tide timings are not configured for this deployment.', tone: 'info' },
    ]),
  ];
  const alerts = [
    ...(metrics.rainChancePct >= 80 ? [{ severity: 'amber', title: 'Heavy rain likely', description: `Rain probability is ${metrics.rainChancePct}% today. Plan extra travel time and carry rain protection.`, source: 'Open-Meteo forecast', issuedAt: metrics.timestamp }] : []),
    ...(metrics.visibilityKm < 4 ? [{ severity: 'amber', title: 'Reduced visibility', description: `Visibility is around ${metrics.visibilityKm} km. Use caution while travelling.`, source: 'Open-Meteo forecast', issuedAt: metrics.timestamp }] : []),
    ...(temperature >= 40 ? [{ severity: 'red', title: 'Extreme heat', description: 'High temperatures may create heat-health risk. Hydrate and limit midday exposure.', source: 'Open-Meteo forecast', issuedAt: metrics.timestamp }] : []),
  ].slice(0, 2);
  const travellerAdvice = [
    ...(travelResults ?? [{ icon: travelType === 'international' ? 'Plane' : travelMode === 'bus' ? 'Bus' : travelMode === 'train' ? 'TrainFront' : 'Plane', title: travelType === 'international' ? 'Flight status' : `${travelMode ?? 'Transit'} options`, body: travelType === 'international' ? 'Select a flight number and configure the flight-status provider to see live delays.' : `${travelMode ?? 'Transit'} schedules and availability require a transit provider for this route.`, tone: 'info' as const }]),
    { icon: 'Car', title: 'Route traffic', body: metrics.traffic ? `${metrics.traffic.delayMin} min road delay on the route.` : metrics.routeConfigured ? 'TomTom has no usable road-traffic result for this long intercity route. Traffic is best shown for airport, station, and local road segments.' : 'Select a route to see local road traffic.', tone: metrics.traffic ? 'good' : 'info' },
    { icon: 'CloudRain', title: 'Travel weather', body: metrics.rainChancePct > 50 ? `Rain probability is ${metrics.rainChancePct}%. Keep a weather backup in your plan.` : 'Weather is currently manageable for travel.', tone: metrics.rainChancePct > 50 ? 'warn' : 'good' },
  ];

  return {
    version: '1.0',
    persona,
    location,
    theme: temperature >= 34 ? 'heat' : 'cloud',
    generatedAt: metrics.timestamp,
    components: [
      ...alerts.map((alert, index) => ({ id: `alert-${index}`, type: 'WeatherAlert', props: alert })),
      { id: 'hero', type: 'WeatherHero', props: { temperature, feelsLike: temperature, condition: 'Current conditions', icon: 'CloudSun', hi: temperature, lo: temperature, locationLabel: location.label, summary: persona === 'health' ? 'Protect your breathing, skin, and energy with today\'s environmental signals.' : persona === 'parent' ? 'Plan a safer school day with commute, rain, and heat signals.' : persona === 'event' ? 'Choose the best outdoor window with comfort, rain, and wind signals.' : 'Weather data is ready for your personalized dashboard.', stats: [{ icon: 'Droplets', label: 'Humidity', value: `${metrics.humidityPct}%` }, { icon: 'Activity', label: 'Air quality', value: `AQI ${metrics.aqi}` }] } },
      { id: 'metrics', type: 'MetricsGrid', props: { title: persona === 'health' ? 'Health signals' : persona === 'parent' ? 'Family conditions' : persona === 'event' ? 'Event conditions' : persona === 'farmer' ? 'Field conditions' : persona === 'fisherman' ? 'Marine conditions' : persona === 'student' ? 'Commute conditions' : 'Environment details', metrics: metricItems } },
      { id: 'hourly', type: 'HourlyForecast', props: { title: 'Hourly forecast', hours: metrics.hourly } },
      { id: 'daily', type: 'DailyForecast', props: { title: '7-day forecast', days: metrics.daily } },
      { id: 'advisory', type: 'Advisory', props: { icon: persona === 'health' ? 'HeartPulse' : persona === 'parent' ? 'Users' : persona === 'event' ? 'CalendarDays' : persona === 'farmer' ? 'Sprout' : persona === 'traveller' ? 'Plane' : 'Sparkles', accent: persona === 'health' ? 'rose' : persona === 'parent' ? 'amber' : persona === 'event' ? 'violet' : persona === 'farmer' ? 'emerald' : persona === 'traveller' ? 'violet' : 'sky', title: persona === 'student' ? 'Commute brief' : persona === 'health' ? 'Health brief' : persona === 'parent' ? 'Family brief' : persona === 'event' ? 'Event planner' : persona === 'farmer' ? 'Agri advisory' : persona === 'traveller' ? 'Travel planner' : 'Today\'s brief', subtitle: 'Generated from the current data providers', metrics: [{ label: 'Rain chance', value: `${metrics.rainChancePct}%` }], items: persona === 'health' ? healthAdvice(metrics) : persona === 'parent' ? parentAdvice(metrics) : persona === 'event' ? eventAdvice(metrics) : persona === 'farmer' ? farmerAdvice(metrics) : persona === 'traveller' && travelType ? travellerAdvice : generalAdvice } },
      { id: 'locations', type: 'LocationSection', props: { title: 'Locations', gpsEnabled: true, current: { city: location.city, state: location.state, label: `${location.lat.toFixed(2)}° N · ${location.lon.toFixed(2)}° E` }, saved: QUICK_LOCATIONS } },
    ],
  };
}
