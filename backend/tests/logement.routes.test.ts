import request from 'supertest';
import app from '../src/app';
import { LogementService } from '../src/services/logement.service';

interface LogementStub {
  id: number;
  libelle: string;
}

jest.mock('../src/services/logement.service');

const mockedService = LogementService as jest.Mocked<typeof LogementService>;

describe('GET /api/v1/logements', () => {
  it('returns logements from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: 1, libelle: 'Test' } as LogementStub,
    ]);

    const res = await request(app).get('/api/v1/logements');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
