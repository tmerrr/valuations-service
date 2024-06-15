import { beforeAll, afterAll } from 'vitest'
import { app } from '@app/app'
import CircuitBreaker from '@app/lib/CircuitBreaker'

export const circuitBreaker = new CircuitBreaker({
  failureThresholdPercentage: 50,
  resetTimeout: 5_000,
});

// circuit breaker is injected as a dep
export const fastify = app({}, { circuitBreaker });

beforeAll(async () => {
  // called once before all tests run
  await fastify.ready()
})
afterAll(async () => {
  // called once after all tests run
  await fastify.close()
})
