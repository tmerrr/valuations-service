import { premiumCarValuationUrl } from '@app/config';
import { fetchValuationFromPremiumCarValuation } from '../premium-car/premium-car-valuation';
import axios from 'axios';

vi.mock("axios");
const mockAxios = vi.mocked(axios);

const mockResponse = `<?xml version="1.0" encoding="UTF-8" ?>
<root>
  <RegistrationDate>2012-06-14T00:00:00.0000000</RegistrationDate>
  <RegistrationYear>2001</RegistrationYear>
  <RegistrationMonth>10</RegistrationMonth>
  <ValuationPrivateSaleMinimum>11500</ValuationPrivateSaleMinimum>
  <ValuationPrivateSaleMaximum>12750</ValuationPrivateSaleMaximum>
  <ValuationDealershipMinimum>9500</ValuationDealershipMinimum>
  <ValuationDealershipMaximum>10275</ValuationDealershipMaximum>
</root>`;

describe('fetchValuationFromPremiumCarValuation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully fetches and parses the valuation", async () => {
    mockAxios.mockResolvedValue({ status: 200, data: mockResponse });

    const vrm = "ABC123";
    const valuation = await fetchValuationFromPremiumCarValuation(vrm, 10000);

    expect(valuation).toEqual({
      vrm,
      lowestValue: 9_500,
      highestValue: 10_275,
      providerName: 'PremiumCarValuation',
    });
    expect(mockAxios).toHaveBeenCalledWith({
      url: `${premiumCarValuationUrl}/valueCar`,
      method: 'GET',
      params: {
        vrm,
        mileage: 10000,
      },
    });
  });
});
