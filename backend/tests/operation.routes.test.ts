import request from 'supertest';
import app from '../src/app';
import { OperationService } from '../src/services/operation.service';

interface OperationStub {
  id: number;
  libelle?: string | null;
}

jest.mock('../src/services/operation.service');

const mockedService = OperationService as jest.Mocked<typeof OperationService>;

describe('GET /api/v1/operations', () => {
  it('returns operations from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: 1, libelle: 'test' } as OperationStub,
    ]);

    const res = await request(app).get('/api/v1/operations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
