import CircuitBreaker from '@app/lib/CircuitBreaker';
import { VehicleValuation } from '@app/models/vehicle-valuation';

import { fetchValuationFromPremiumCarValuation } from '../premium-car/premium-car-valuation';
import { fetchValuationFromSuperCarValuation } from '../super-car/super-car-valuation';
import { fetchCarValuationWithBreaker } from '../fetchCarValuation';

vi.mock('../premium-car/premium-car-valuation');
vi.mock('../super-car/super-car-valuation');

const mockFetchPremiumCarValuation = vi.mocked(fetchValuationFromPremiumCarValuation);
const mockFetchSuperCarValuation = vi.mocked(fetchValuationFromSuperCarValuation);

const valuation: VehicleValuation = {
  vrm: '1234567',
  lowestValue: 1_000,
  highestValue: 2_000,
  midpointValue: 1_500,
  providerName: 'SuperCarValuation',
};

describe('fetchCarValuation', () => {
  const breaker = new CircuitBreaker({
    failureThresholdPercentage: 50,
    resetTimeout: 1_000,
  });

  const fetchCarValuation = fetchCarValuationWithBreaker(breaker);

  beforeEach(() => {
    breaker.overrideState('CLOSED');
    vi.restoreAllMocks();
  });


  it('should return the valuation from the primary service when circuit is closed', async () => {
    mockFetchSuperCarValuation.mockResolvedValueOnce(valuation);

    const result = await fetchCarValuation('1234567', 1_500);

    expect(result).toEqual({
      data: valuation,
      err: null,
    });
  });

  it('should return the valuation from the fallback service when circuit is open', async () => {
    breaker.overrideState('OPEN');

    mockFetchPremiumCarValuation.mockResolvedValueOnce(valuation);

    const result = await fetchCarValuation('1234567', 1_500);

    expect(result).toEqual({
      data: valuation,
      err: null,
    });
  });

  it('should return an error when both services fail', async () => {
    mockFetchSuperCarValuation.mockRejectedValueOnce(new Error('SuperCarValuation failed'));
    mockFetchPremiumCarValuation.mockRejectedValueOnce(new Error('PremiumCarValuation failed'));

    const result = await fetchCarValuation('1234567', 1_500);

    expect(result).toEqual({
      data: null,
      err: new Error('Unable to fetch valuation'),
    });
  });
});
