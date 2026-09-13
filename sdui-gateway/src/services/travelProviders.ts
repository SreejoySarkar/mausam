import type { TravelMode } from '../engine/travelTypes';

export interface TravelProviderResult {
  title: string;
  body: string;
  tone: 'info' | 'good' | 'warn' | 'danger';
  icon: string;
}

async function readJson(url: string, init?: RequestInit): Promise<Record<string, any>> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Travel provider failed (${response.status})`);
  return response.json() as Promise<Record<string, any>>;
}

export async function getFlightStatus(flightNumber: string | undefined, travelDate: string | undefined): Promise<TravelProviderResult> {
  if (!flightNumber || !travelDate) return { title: 'Flight status', body: 'Enter a flight number and travel date to check live delays.', tone: 'info', icon: 'Plane' };
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key) return { title: 'Flight status', body: 'Flight tracking is not configured. Add AVIATIONSTACK_API_KEY to the gateway.', tone: 'info', icon: 'Plane' };
  try {
    const url = new URL('https://api.aviationstack.com/v1/flights');
    url.search = new URLSearchParams({ access_key: key, flight_iata: flightNumber, flight_date: travelDate }).toString();
    const data = await readJson(url.toString());
    const flight = data.data?.[0];
    if (!flight) return { title: 'Flight status', body: `No flight record found for ${flightNumber} on ${travelDate}.`, tone: 'info', icon: 'Plane' };
    const departureDelay = typeof flight.departure?.delay === 'number' ? flight.departure.delay : 0;
    const arrivalDelay = typeof flight.arrival?.delay === 'number' ? flight.arrival.delay : 0;
    const delay = Math.max(departureDelay, arrivalDelay);
    return { title: 'Flight status', body: delay > 0 ? `${flightNumber} is delayed by ${delay} minutes.` : `${flightNumber} is currently ${flight.flight_status ?? 'scheduled'}.`, tone: delay >= 60 ? 'danger' : delay > 0 ? 'warn' : 'good', icon: 'Plane' };
  } catch (error) {
    console.warn('[travel] flight provider unavailable:', error instanceof Error ? error.message : error);
    return { title: 'Flight status', body: 'Flight status could not be loaded from the provider.', tone: 'info', icon: 'Plane' };
  }
}

export async function getTransitStatus(mode: TravelMode, origin: { lat: number; lon: number }, destination: { lat: number; lon: number }, travelDate: string | undefined): Promise<TravelProviderResult> {
  const key = process.env.NAVITIA_API_KEY;
  const label = mode === 'bus' ? 'Bus' : 'Train';
  const icon = mode === 'bus' ? 'Bus' : 'TrainFront';
  if (!key) return { title: `${label} options`, body: `${label} schedules require NAVITIA_API_KEY in the gateway.`, tone: 'info', icon };
  if (!travelDate) return { title: `${label} options`, body: `Choose a travel date to search ${label.toLowerCase()} journeys.`, tone: 'info', icon };
  try {
    const coverage = `${origin.lon};${origin.lat}`;
    const url = new URL(`https://api.navitia.io/v1/coverage/${coverage}/journeys`);
    url.search = new URLSearchParams({ from: `${origin.lon};${origin.lat}`, to: `${destination.lon};${destination.lat}`, datetime: `${travelDate.replace(/-/g, '')}T080000` }).toString();
    const data = await readJson(url.toString(), { headers: { Authorization: key } });
    const journeys = Array.isArray(data.journeys) ? data.journeys : [];
    const matching = journeys.filter((journey: any) => journey.sections?.some((section: any) => section?.mode === mode || section?.physical_mode === mode));
    return matching.length ? { title: `${label} options`, body: `${matching.length} ${label.toLowerCase()} journey option${matching.length === 1 ? '' : 's'} found for ${travelDate}.`, tone: 'good', icon } : { title: `${label} options`, body: `No ${label.toLowerCase()} journeys found for ${travelDate}.`, tone: 'info', icon };
  } catch (error) {
    console.warn(`[travel] ${label.toLowerCase()} provider unavailable:`, error instanceof Error ? error.message : error);
    return { title: `${label} options`, body: `${label} schedules could not be loaded from the provider.`, tone: 'info', icon };
  }
}
