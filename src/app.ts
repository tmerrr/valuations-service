import './env';
import 'reflect-metadata';

import { fastify as Fastify, FastifyServerOptions } from 'fastify';
import { valuationRoutes } from './routes/valuation';

import databaseConnection from 'typeorm-fastify-plugin';
import { VehicleValuation } from './models/vehicle-valuation';
import CircuitBreaker from './lib/CircuitBreaker';
import { circuitBreakerConfig } from './config';

interface Dependencies {
  circuitBreaker: CircuitBreaker;
}

export const app = (opts?: FastifyServerOptions, deps?: Dependencies) => {
  const fastify = Fastify(opts);
  fastify
    .register(databaseConnection, {
      type: 'sqlite',
      database: process.env.DATABASE_PATH!,
      synchronize: process.env.SYNC_DATABASE === 'true',
      logging: false,
      entities: [VehicleValuation],
      migrations: [],
      subscribers: [],
    })
    .ready();

  const circuitBreaker = deps?.circuitBreaker ?? new CircuitBreaker(circuitBreakerConfig);
  fastify.decorate('circuitBreaker', circuitBreaker);

  fastify.get('/', async () => {
    return { hello: 'world' };
  });

  valuationRoutes(fastify);

  return fastify;
};
