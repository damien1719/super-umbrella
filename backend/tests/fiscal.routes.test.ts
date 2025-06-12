import request from 'supertest';
import app from '../src/app';
import { FiscalService } from '../src/services/fiscal.service';

jest.mock('../src/services/fiscal.service');

const mockedService = FiscalService as jest.Mocked<typeof FiscalService>;

describe('GET /api/v1/fiscal/result', () => {
  it('returns result from service', async () => {
    (mockedService.compute as jest.Mock).mockResolvedValueOnce({
      produits: 200,
      charges: 50,
      resultat: 150,
      groupes: [],
    });

    const res = await request(app).get('/api/v1/fiscal/result?anneeId=1&activityId=1');
    expect(res.status).toBe(200);
    expect(res.body.produits).toBe(200);
    expect(mockedService.compute).toHaveBeenCalledWith({ anneeId: 1n, activityId: 1n });
  });
});
