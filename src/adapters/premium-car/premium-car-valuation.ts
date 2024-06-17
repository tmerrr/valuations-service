import axios from 'axios';
import { parseStringPromise } from 'xml2js';

import { VehicleValuation } from '../../models/vehicle-valuation';
import { PremiumCarValuationResponse } from './types/premium-car-valuation-response';

export async function fetchValuationFromPremiumCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {
  axios.defaults.baseURL =
    'https://run.mocky.io/v3/0dfda26a-3a5a-43e5-b68c-51f148eda473';
  // data will be an xml string, needs parsing to an object
  // mileage is missing from the swagger doc, but going to assume a mistake and would be required to obtain a valuation
  const response = await axios.get<string>(
    `valueCar?vrm=${vrm}&mileage=${mileage}`,
  );

  const premiumCarValuation = await parsePremiumCarValuationResponse(response.data);

  const valuation = new VehicleValuation();

  valuation.vrm = vrm;
  valuation.lowestValue = premiumCarValuation.dealershipValuation.lowerValue;
  valuation.highestValue = premiumCarValuation.dealershipValuation.upperValue;

  return valuation;
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