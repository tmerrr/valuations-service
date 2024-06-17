import axios from 'axios';

import { VehicleValuation } from '../../models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';

export async function fetchValuationFromSuperCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {
  axios.defaults.baseURL =
    'https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b';
  const response = await axios.get<SuperCarValuationResponse>(
    `valuations/${vrm}?mileage=${mileage}`,
  );

  return VehicleValuation.from({
    vrm,
    lowestValue: response.data.valuation.lowerValue,
    highestValue: response.data.valuation.upperValue,
    providerName: 'SuperCarValuation',
  });
}
