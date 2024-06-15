import { Plate } from "@app/adapters/super-car/types/plate";

type CarValuation = {
  lowerValue: number;
  upperValue: number;
};

export type PremiumCarValuationResponse = {
  registrationDate: string;
  plate: Plate;
  privateSaleValuation: CarValuation;
  dealershipValuation: CarValuation;
};
