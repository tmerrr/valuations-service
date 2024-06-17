export type CircuitBreakerConfig = {
  failureThresholdPercentage: number;
  resetTimeout: number;
};

// simplified state so not using half open, but leaves open to extension
export type CircuitBreakerState = 'CLOSED' | 'OPEN';

type GenericFunction<T> = () => Promise<T>;

export default class CircuitBreaker {
  private _state: CircuitBreakerState = 'CLOSED';

  private totalCount = 0;

  private failureCount = 0;

  private failureThresholdPercentage: number;

  private resetTimeout: number;

  constructor(config: CircuitBreakerConfig) {
    this.failureThresholdPercentage = config.failureThresholdPercentage;
    this.resetTimeout = config.resetTimeout;
  }

  get state(): CircuitBreakerState {
    return this._state;
  }

  public isClosed(): boolean {
    return this.state === 'CLOSED';
  }

  public isOpen(): boolean {
    return this.state === 'OPEN';
  }

  public overrideState(state: CircuitBreakerState): void {
    this._state = state;
  };

  public async run<T>(
    primaryFn: GenericFunction<T>,
    fallbackFn?: GenericFunction<T>,
  ): Promise<T> {
    if (this.isOpen()) {
      if (fallbackFn) {
        return fallbackFn();
      }
      throw new Error('Circuit is open and no fallback provided');
    }

    try {
      const data = await primaryFn();
      this.onSuccess();
      return data;
    } catch (err) {
      this.onFailure();
      if (fallbackFn) {
        return fallbackFn();
      }
      throw err;
    }
  }

  private onSuccess(): void {
    this.totalCount++;
  }

  private onFailure(): void {
    this.totalCount++;
    this.failureCount++;
    if (this.isThresholdReached()) {
      this.open();
      setTimeout(() => this.reset(), this.resetTimeout);
    }
  }

  private isThresholdReached(): boolean {
    return (this.failureCount / this.totalCount) > (this.failureThresholdPercentage / 100);
  }

  private reset(): void {
    this.failureCount = 0;
    this.totalCount = 0;
    this.close();
  }

  private open(): void {
    this.overrideState('OPEN');
  }

  private close(): void {
    this.overrideState('CLOSED');
  }
}
