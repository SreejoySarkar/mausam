import Fastify from 'fastify';
import { getAggregatedMetrics } from './services/dataAggregator';
import { generateSDUILayout } from './engine/sduiEngine';

const fastify = Fastify({ logger: true });

interface QueryParams {
  lat?: string;
  lon?: string;
  profile?: string;
}

fastify.get('/v1/layout', async (request, reply) => {
  const { lat, lon, profile = 'COMMUTE' } = request.query as QueryParams;

  const latitude = lat ? parseFloat(lat) : 12.9716; // Default to Bangalore lat
  const longitude = lon ? parseFloat(lon) : 77.5946; // Default to Bangalore lon

  try {
    // 1. Fetch cached or fresh raw data (Member 4 logic)
    const rawMetrics = await getAggregatedMetrics(latitude, longitude);

    // 2. Pass data through the SDUI Engine (Member 3 logic)
    const layout = generateSDUILayout(profile, rawMetrics);

    // 3. Return lightweight JSON to the mobile renderer
    return reply.send({
      profile,
      lastUpdated: new Date().toISOString(),
      layout,
    });
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({ error: 'Failed to construct SDUI layout' });
  }
});

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