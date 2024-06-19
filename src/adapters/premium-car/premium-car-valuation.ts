import axios from 'axios';
import { parseStringPromise } from 'xml2js';

import { premiumCarValuationUrl } from '@app/config';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { PremiumCarValuationResponse } from './types/premium-car-valuation-response';

export async function fetchValuationFromPremiumCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {
  // data will be an xml string, needs parsing to an object
  const response = await axios<string>({
    url: `${premiumCarValuationUrl}/valueCar`,
    method: 'GET',
    params: {
      vrm,
      // mileage is missing from the swagger doc, but going to assume a mistake and would be required to obtain a valuation
      mileage,
    },
  });

  const premiumCarValuation = await parsePremiumCarValuationResponse(response.data);

  return VehicleValuation.from({
    vrm,
    lowestValue: premiumCarValuation.dealershipValuation.lowerValue,
    highestValue: premiumCarValuation.dealershipValuation.upperValue,
    providerName: 'PremiumCarValuation',
  });
}

const parsePremiumCarValuationResponse = async (xmlData: string): Promise<PremiumCarValuationResponse> => {
  const parsedData = await parseStringPromise(xmlData);
  return {
    registrationDate: parsedData.root.RegistrationDate[0],
    plate: {
      month: parseInt(parsedData.root.RegistrationMonth[0]),
      year: parseInt(parsedData.root.RegistrationYear[0]),
    },
    privateSaleValuation: {
      lowerValue: parseInt(parsedData.root.ValuationPrivateSaleMinimum[0]),
      upperValue: parseInt(parsedData.root.ValuationPrivateSaleMaximum[0]),
    },
    dealershipValuation: {
      lowerValue: parseInt(parsedData.root.ValuationDealershipMinimum[0]),
      upperValue: parseInt(parsedData.root.ValuationDealershipMaximum[0]),
    },
  };
};