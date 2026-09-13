import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { getAggregatedMetrics, searchPlaces, type RouteCoordinates } from './services/dataAggregator';
import { generateSDUILayout } from './engine/sduiEngine';
import { getFlightStatus, getTransitStatus, type TravelProviderResult } from './services/travelProviders';

const fastify = Fastify({ logger: true });
fastify.register(cors, { origin: true });

interface QueryParams {
  lat?: string;
  lon?: string;
  profile?: string;
  persona?: string;
  place?: string;
  originLat?: string;
  originLon?: string;
  destinationLat?: string;
  destinationLon?: string;
  travelType?: 'domestic' | 'international';
  travelMode?: 'flight' | 'bus' | 'train';
  travelDate?: string;
  flightNumber?: string;
}

interface PlaceSearchQuery {
  q?: string;
  lat?: string;
  lon?: string;
  scope?: 'nearby' | 'global';
}

async function serveHome(request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) {
  const { lat, lon, profile, persona, place, originLat, originLon, destinationLat, destinationLon, travelType, travelMode, travelDate, flightNumber } = request.query;

  const latitude = lat ? parseFloat(lat) : 12.9716; // Default to Bangalore lat
  const longitude = lon ? parseFloat(lon) : 77.5946; // Default to Bangalore lon
  const city = place || 'Bengaluru';
  const selectedProfile = persona || profile || 'general';
  const location = {
    id: `geo-${latitude}-${longitude}`,
    city,
    state: '',
    label: city,
    lat: latitude,
    lon: longitude,
  };
  const routeValues = [originLat, originLon, destinationLat, destinationLon].map((value) => value ? Number(value) : NaN);
  const route: RouteCoordinates | undefined = routeValues.every(Number.isFinite)
    ? { originLat: routeValues[0], originLon: routeValues[1], destinationLat: routeValues[2], destinationLon: routeValues[3] }
    : undefined;

  try {
    // 1. Fetch cached or fresh raw data (Member 4 logic)
    const rawMetrics = await getAggregatedMetrics(latitude, longitude, route);

    // 2. Pass data through the SDUI Engine (Member 3 logic)
    let travelResults: TravelProviderResult[] | undefined;
    if (selectedProfile === 'traveller' && route && travelType && travelMode) {
      const providerResult = travelMode === 'flight'
        ? await getFlightStatus(flightNumber, travelDate)
        : await getTransitStatus(travelMode, { lat: route.originLat, lon: route.originLon }, { lat: route.destinationLat, lon: route.destinationLon }, travelDate);
      travelResults = [providerResult];
    }
    const layout = generateSDUILayout(selectedProfile, rawMetrics, location, travelType, travelMode, travelResults);

    return reply.send(layout);
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to construct SDUI layout' });
  }
}

fastify.get('/v1/home', serveHome);
fastify.get('/v1/layout', serveHome);
fastify.get('/v1/places/search', async (request: FastifyRequest<{ Querystring: PlaceSearchQuery }>, reply: FastifyReply) => {
  const { q, lat, lon, scope = 'nearby' } = request.query;
  const results = await searchPlaces(q ?? '', lat ? Number(lat) : undefined, lon ? Number(lon) : undefined, scope === 'nearby');
  return reply.send({ results });
});
fastify.get('/', async () => ({
  service: 'Mausam SDUI Gateway',
  status: 'ok',
  endpoints: ['/v1/home', '/v1/layout'],
  usage: '/v1/home?persona=health&lat=12.9716&lon=77.5946&place=Bengaluru',
}));

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Fastify SDUI Gateway running on http://localhost:4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();