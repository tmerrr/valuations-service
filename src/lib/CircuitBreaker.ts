export type CircuitBreakerConfig = {
  errorThresholdPercentage: number;
  resetTimeout: number;
};

type GenericFunction<T> = () => Promise<T>;

export default class CircuitBreaker {
  constructor(config: CircuitBreakerConfig) {}

  public async run<T>(
    primaryFn: () => Promise<T>,
    fallbackFn?: () => Promise<T>,
  ): Promise<T> {
    try {
      const data = await primaryFn();
      return data;
    } catch (err) {
      if (fallbackFn) {
        return fallbackFn();
      }
      throw err;
    }
  }
}
