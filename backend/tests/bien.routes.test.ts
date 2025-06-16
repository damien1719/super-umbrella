import request from 'supertest';
import app from '../src/app';
import { BienService } from '../src/services/bien.service';

interface BienStub {
  id: string;
  typeBien: string;
}

jest.mock('../src/services/bien.service');

const mockedService = BienService as jest.Mocked<typeof BienService>;

describe('GET /api/v1/biens', () => {
  it('returns biens from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', typeBien: 'APPARTEMENT' } as BienStub,
    ]);

    const res = await request(app).get('/api/v1/biens');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
