import { CircuitBreakerConfig } from "./lib/CircuitBreaker"

const failureThresholdPercentage = process.env.BREAKER_FAILURE_THRESHOLD_PERCENTAGE;
const resetTimeout = process.env.BREAKER_RESET_TIMEOUT;

export const circuitBreakerConfig: CircuitBreakerConfig = {
  failureThresholdPercentage: failureThresholdPercentage ? parseInt(failureThresholdPercentage, 10) : 50,
  resetTimeout: resetTimeout ? parseInt(resetTimeout, 10) : 60_000,
};
