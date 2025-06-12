import request from 'supertest';
import app from '../src/app';
import { AmortissementService } from '../src/services/amortissement.service';

jest.mock('../src/services/amortissement.service');

const mockedService = AmortissementService as jest.Mocked<typeof AmortissementService>;

describe('GET /api/v1/amortissements', () => {
  it('returns result from service', async () => {
    mockedService.compute.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/v1/amortissements?anneeId=1&activityId=1');
    expect(res.status).toBe(200);
    expect(mockedService.compute).toHaveBeenCalledWith({ anneeId: 1n, activityId: 1n });
  });
});
