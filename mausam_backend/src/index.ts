import Fastify from 'fastify';
import alertRoutes from './routes/alerts.route';
import { startAlertWorker } from './kafka/consumer';

const fastify = Fastify({ logger: true });

fastify.register(alertRoutes);

const start = async () => {
  try {
    startAlertWorker().catch((err) => {
      fastify.log.error(err, 'Alert worker crashed');
    });

    await fastify.listen({ port: 3000, host: '0.0.0.0' });

    console.log('Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();