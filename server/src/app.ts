import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './domains/auth/routes.ts';
import { geoRoutes } from './domains/geo/routes.ts';
import { catalogRoutes } from './domains/catalog/routes.ts';
import { bookingRoutes } from './domains/bookings/routes.ts';
import { inspectionRoutes } from './domains/inspection/routes.ts';
import { ledgerRoutes } from './domains/ledger/routes.ts';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: false
  });

  // Enable CORS for web frontend
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  });

  // Health endpoint
  app.get('/api/health', async () => {
    return {
      status: 'UP',
      service: 'Rently Tri-City API & Ledger Engine',
      version: '1.0.0',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };
  });

  // Register domain plugins under /api/v1/
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(geoRoutes, { prefix: '/api/v1/geo' });
  app.register(catalogRoutes, { prefix: '/api/v1/catalog' });
  app.register(bookingRoutes, { prefix: '/api/v1/bookings' });
  app.register(inspectionRoutes, { prefix: '/api/v1/inspection' });
  app.register(ledgerRoutes, { prefix: '/api/v1/ledger' });

  // Custom 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Endpoint not found',
      path: request.url,
      availableDomains: [
        '/api/health',
        '/api/v1/auth',
        '/api/v1/geo',
        '/api/v1/catalog',
        '/api/v1/bookings',
        '/api/v1/inspection',
        '/api/v1/ledger'
      ]
    });
  });

  // Global Error Handler
  app.setErrorHandler((error, _request, reply) => {
    reply.status(error.statusCode || 500).send({
      error: error.message || 'Internal Server Error',
      statusCode: error.statusCode || 500
    });
  });

  return app;
}
