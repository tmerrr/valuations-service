import CircuitBreaker from '../lib/CircuitBreaker';

describe('CircuitBreaker', () => {
  describe('run', () => {
    it('should successfully return the value of the function on success', async () => {
      const cb = new CircuitBreaker({
        errorThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      const value = 1;
      const fn = vi.fn().mockResolvedValue(value);
      await expect(cb.run(fn)).resolves.toEqual(value);
    });
  
    it('should return the value of "run" when successful, when a fallback is provided', async () => {
      const cb = new CircuitBreaker({
        errorThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      const value = 1;
      const fn = vi.fn().mockResolvedValue(value);
      const fallback = vi.fn().mockResolvedValue(2);
      await expect(cb.run(fn, fallback)).resolves.toEqual(value);
    });
  
    it('should return the value of the fallback when the primary function fails', async () => {
      const cb = new CircuitBreaker({
        errorThresholdPercentage: 50,
        resetTimeout: 1_000,
      });
      const value = 1;
      const fn = vi.fn().mockRejectedValue(new Error('test'));
      const fallback = vi.fn().mockResolvedValue(value);
      await expect(cb.run(fn, fallback)).resolves.toEqual(value);
    });
  });
});
