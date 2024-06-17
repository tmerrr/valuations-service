import CircuitBreaker from '../CircuitBreaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe('state / isOpen / isClosed', () => {
    it('should return "CLOSED" when the circuit is closed', () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      expect(cb.state).toBe('CLOSED');
      expect(cb.isClosed()).toBe(true);
      expect(cb.isOpen()).toBe(false);
    });

    it('should return "OPEN" when the circuit is open', () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      cb.overrideState('OPEN');
      expect(cb.state).toBe('OPEN');
      expect(cb.isClosed()).toBe(false);
      expect(cb.isOpen()).toBe(true);
    });
  });

  describe('run', () => {
    it('should successfully return the value of the function on success', async () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      const value = 1;
      const fn = vi.fn().mockResolvedValue(value);
      await expect(cb.run(fn)).resolves.toEqual(value);
      expect(cb.state).toBe('CLOSED');
    });
  
    it('should return the value of "run" when successful, when a fallback is provided', async () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      const value = 1;
      const fn = vi.fn().mockResolvedValue(value);
      const fallback = vi.fn().mockResolvedValue(2);
      await expect(cb.run(fn, fallback)).resolves.toEqual(value);
    });
  
    it('should return the value of the fallback when the primary function fails', async () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      const value = 1;
      const fn = vi.fn().mockRejectedValue(new Error('test'));
      const fallback = vi.fn().mockResolvedValue(value);
      await expect(cb.run(fn, fallback)).resolves.toEqual(value);
    });

    it('should call the fallback fn when the circuit is open', async () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      cb.overrideState('OPEN');
      const value = 1;
      const primary = vi.fn();
      const fallback = vi.fn().mockResolvedValue(value);
      await expect(cb.run(primary, fallback)).resolves.toEqual(value);
      expect(primary).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when the circuit is open and no fallback is provided', async () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      cb.overrideState('OPEN');
      const primary = vi.fn();
      await expect(cb.run(primary)).rejects.toThrow('Circuit is open and no fallback provided');
      expect(primary).not.toHaveBeenCalled();
    });

    it('remains in "CLOSED" state until the failure threshold is reached', async () => {
      const cb = new CircuitBreaker({
        failureThresholdPercentage: 49,
        resetTimeout: 1_000,
      });
      const error = new Error('something went wrong!');
      const fn = vi.fn()
        .mockResolvedValueOnce(1)
        .mockRejectedValueOnce(error);

      await expect(cb.run(fn)).resolves.toEqual(1);
      expect(cb.state).toBe('CLOSED');

      await expect(cb.run(fn)).rejects.toThrow(error);
      expect(cb.state).toBe('OPEN');
    });

    it('should reset the state of the circuit after the resetTimeout has passed', async () => {
      vi.useFakeTimers();

      const cb = new CircuitBreaker({
        failureThresholdPercentage: 50,
        resetTimeout: 2_000,
      });

      const fn = vi.fn().mockRejectedValue(new Error('something went wrong!'));
      await expect(cb.run(fn)).rejects.toThrow();
      expect(cb.state).toBe('OPEN');
      vi.advanceTimersByTime(2_000);
      expect(cb.state).toBe('CLOSED');
    });
  });
});
