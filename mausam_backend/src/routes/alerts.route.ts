import { FastifyInstance } from 'fastify';
import { publishWeatherAlert } from '../kafka/producer';

export default async function alertRoutes(fastify: FastifyInstance) {
  fastify.post('/webhooks/severe-weather', async (request, reply) => {
    const alertData = request.body as {
      title: string;
      description: string;
      targetProfile: string;
      severity?: string;
    };

    if (!alertData.title || !alertData.description || !alertData.targetProfile) {
      return reply.status(400).send({ error: 'title, description, and targetProfile are required' });
    }

    await publishWeatherAlert(alertData);

    return reply.status(202).send({ status: 'queued' });
  });
}