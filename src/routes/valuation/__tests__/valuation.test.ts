import { fastify } from '~root/test/fastify';
import { SuperCarValuationResponse } from '@app/super-car/types/super-car-valuation-response';
import axios from 'axios';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';

vi.mock("axios");

const mockAxiosGet = vi.mocked(axios.get);

describe('ValuationController (e2e)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('PUT /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 200 with valid request', async () => {
      const vrm = 'ABC123';
      const highestValue = 20_000;
      const lowestValue = 15_000;

      const mockApiResponse: SuperCarValuationResponse = {
        vin: '1234567890',
        registrationDate: '2021-01-01',
        plate: {
          month: 4,
          year: 2021,
        },
        valuation: {
          lowerValue: lowestValue,
          upperValue: highestValue,
        },
      };

      mockAxiosGet.mockResolvedValue({
        status: 200,
        data: mockApiResponse,
      })

      // prefer to avoid any type where possible, but allows us to simply mock the only fn used
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValueOnce({
        insert: vi.fn().mockResolvedValueOnce({}),
      } as any);

      const requestBody: VehicleValuationRequest = {
        mileage: 10_000,
      };

      const res = await fastify.inject({
        url: `/valuations/${vrm}`,
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body)).toEqual({
        vrm,
        highestValue,
        lowestValue,
      });
    });
  });
});
