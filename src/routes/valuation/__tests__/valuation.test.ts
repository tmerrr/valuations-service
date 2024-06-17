import { fastify, circuitBreaker } from '~root/test/fastify';
import { SuperCarValuationResponse } from '@app/adapters/super-car/types/super-car-valuation-response';
import axios from 'axios';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';

vi.mock("axios");

const mockAxiosGet = vi.mocked(axios.get);

describe('ValuationController (e2e)', () => {
  beforeEach(() => {
    (circuitBreaker as any).reset();
    vi.resetAllMocks();
  });

  describe('PUT /valuations/:vrm', () => {
    it('should return a 503 when both valuation providers are down', async () => {
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValueOnce({
        findOneBy: vi.fn().mockResolvedValueOnce(null),
      } as any);

      mockAxiosGet.mockRejectedValue(new Error('test'));
      
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };
      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(503);
    });

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
        findOneBy: vi.fn().mockResolvedValueOnce(null),
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

    it('should return an existing valuation if one exists', async () => {
      const existingValuation = {
        vrm: 'ABC123',
        highestValue: 20_000,
        lowestValue: 15_000,
      };
      vi.spyOn(fastify.orm, 'getRepository').mockReturnValueOnce({
        findOneBy: vi.fn().mockResolvedValueOnce(existingValuation),
      } as any);

      const requestBody: VehicleValuationRequest = {
        mileage: 10_000,
      };
      const res = await fastify.inject({
        url: `/valuations/${existingValuation.vrm}`,
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body)).toEqual(existingValuation);
    });
  });

  describe('GET /valuations/:vrm', () => {
    it.each([
      '',
      '12345678',
    ])('should return 400 status and error message when invalid vim supplied', async (vrm) => {
      const res = await fastify.inject({
        url: `/valuations/${vrm}`,
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(400);
      expect(JSON.parse(res.body)).toEqual({
        message: 'vrm must be 7 characters or less',
        statusCode: 400,
      });
    });

    it('should return 404 status and error message when valuation not found for VRM', async () => {
      const vrm = 'ABC123';

      vi.spyOn(fastify.orm, 'getRepository').mockReturnValueOnce({
        findOneBy: vi.fn().mockResolvedValueOnce(null),
      } as any);

      const res = await fastify.inject({
        url: `/valuations/${vrm}`,
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(404);
      expect(JSON.parse(res.body)).toEqual({
        message: `Valuation for VRM ${vrm} not found`,
        statusCode: 404,
      });
    });

    it('should return 200 status and valuation when found for VRM', async () => {
      const vrm = 'ABC123';
      const valuation = {
        vrm,
        highestValue: 20_000,
        lowestValue: 15_000,
      };

      vi.spyOn(fastify.orm, 'getRepository').mockReturnValueOnce({
        findOneBy: vi.fn().mockResolvedValueOnce(valuation),
      } as any);

      const res = await fastify.inject({
        url: `/valuations/${vrm}`,
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body)).toEqual(valuation);
    });
  });
});
