import { CircuitBreakerConfig } from "./lib/CircuitBreaker"

const failureThresholdPercentage = process.env.BREAKER_FAILURE_THRESHOLD_PERCENTAGE;
const resetTimeout = process.env.BREAKER_RESET_TIMEOUT;

export const circuitBreakerConfig: CircuitBreakerConfig = {
  failureThresholdPercentage: failureThresholdPercentage ? parseInt(failureThresholdPercentage, 10) : 50,
  resetTimeout: resetTimeout ? parseInt(resetTimeout, 10) : 60_000,
};

export const premiumCarValuationUrl = process.env.PREMIUM_CAR_VALUATION_URL || 'https://run.mocky.io/v3/0dfda26a-3a5a-43e5-b68c-51f148eda473';
export const superCarValuationUrl = process.env.SUPER_CAR_VALUATION_URL || 'https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b';
