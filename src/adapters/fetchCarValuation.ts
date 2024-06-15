import { VehicleValuation } from '@app/models/vehicle-valuation';
import CircuitBreaker from '@app/lib/CircuitBreaker';

import { fetchValuationFromPremiumCarValuation } from './premium-car/premium-car-valuation';
import { fetchValuationFromSuperCarValuation } from './super-car/super-car-valuation';

type SuccessResponse = {
  data: VehicleValuation
  err: null;
};

type ErrorResponse = {
  data: null;
  err: Error;
};

type ValuationResponse = SuccessResponse | ErrorResponse;

const successResponse = (data: VehicleValuation): SuccessResponse => ({
  data,
  err: null,
});

const errorResponse = (err: Error): ErrorResponse => ({
  data: null,
  err,
});

const responseWrapper = async (promise: Promise<VehicleValuation>): Promise<ValuationResponse> => {
  try {
    const data = await promise;
    return successResponse(data);
  } catch {
    return errorResponse(new Error('Unable to fetch valuation'));
  }
};

export const fetchCarValuationWithBreaker = (circuitBreaker: CircuitBreaker) => async (vrm: string, value: number) => {
  return responseWrapper(circuitBreaker.run(
    () => fetchValuationFromSuperCarValuation(vrm, value), // primary call
    () => fetchValuationFromPremiumCarValuation(vrm, value), // fallback call
  ));
};
