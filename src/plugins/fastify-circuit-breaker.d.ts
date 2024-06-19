// Extra types that will be used for plugin typings
// fastify.d.ts
import 'fastify';
import type CircuitBreaker from '../lib/CircuitBreaker';

declare module 'fastify' {
  interface FastifyInstance {
    circuitBreaker: CircuitBreaker;
  }
}