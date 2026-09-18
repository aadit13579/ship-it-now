import Fastify from 'fastify';
import cors from '@fastify/cors';
import shipmentRoutes from './src/routes/shipments.js';

const fastify = Fastify({ logger: true });

// Register Plugins and Middleware
fastify.register(cors, { 
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

// Register Routes with a prefix
fastify.register(shipmentRoutes, { prefix: '/shipments' });

const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();