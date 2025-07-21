import request from 'supertest';
import app from '../src/app';
import { BilanService } from '../src/services/bilan.service';

jest.mock('../src/services/bilan.service');

interface BilanStub {
  id: string;
  patientId: string;
}

const mockedService = BilanService as jest.Mocked<typeof BilanService>;

describe('GET /api/v1/bilans', () => {
  it('returns bilans from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', patientId: 'p1' } as BilanStub,
    ]);

    const res = await request(app).get('/api/v1/bilans');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});
