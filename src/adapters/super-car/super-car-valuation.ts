import axios from 'axios';

import { VehicleValuation } from '../../models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';
import { superCarValuationUrl } from '@app/config';

export async function fetchValuationFromSuperCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {
  const response = await axios<SuperCarValuationResponse>({
    url: `${superCarValuationUrl}/valuations/${vrm}`,
    method: 'GET',
    params: { mileage },
  });

  return VehicleValuation.from({
    vrm,
    lowestValue: response.data.valuation.lowerValue,
    highestValue: response.data.valuation.upperValue,
    providerName: 'SuperCarValuation',
  });
}
