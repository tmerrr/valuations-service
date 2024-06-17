import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { fetchCarValuationWithBreaker } from '@app/adapters/fetchCarValuation';

export function valuationRoutes(fastify: FastifyInstance) {
  const { circuitBreaker } = fastify as any;
  const fetchCarValuation = fetchCarValuationWithBreaker(circuitBreaker);

  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      fastify.log.warn('Invalid VRM: ', vrm);
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const result = await valuationRepository.findOneBy({ vrm });

    if (result === null) {
      fastify.log.warn('Valuation not found for VRM: ', vrm);
      return reply
        .code(404)
        .send({
          message: `Valuation for VRM ${vrm} not found`,
          statusCode: 404,
        });
    }

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;
    const { mileage } = request.body;

    if (vrm.length > 7) {
      fastify.log.warn('Invalid VRM: ', vrm);
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      fastify.log.warn('Invalid mileage: ', mileage);
      return reply
        .code(400)
        .send({
          message: 'mileage must be a positive number',
          statusCode: 400,
        });
    }

    const existingValuation = await valuationRepository.findOneBy({ vrm });
    if (existingValuation) {
      fastify.log.info('Valuation already exists: ', existingValuation);
      return existingValuation;
    }

    const { data: valuation, err } = await fetchCarValuation(vrm, mileage);
    if (err) {
      fastify.log.error('Failed to fetch valuation: ', err);
      return reply
        .code(503)
        .send({ message: err.message, statusCode: 503 });
    }

    // Save to DB.
    await valuationRepository.insert(valuation).catch((err) => {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        fastify.log.error('Failed to save valuation: ', err);
        throw err;
      }
    });

    fastify.log.info('Valuation created: ', valuation);

    return valuation;
  });
}
