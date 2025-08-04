import request from 'supertest';
import app from '../src/app';
import { BilanSectionInstanceService } from '../src/services/bilanSectionInstance.service';

jest.mock('../src/services/bilanSectionInstance.service');

interface InstanceStub {
  id: string;
  contentNotes: unknown;
}

const mockedService = BilanSectionInstanceService as jest.Mocked<typeof BilanSectionInstanceService>;

describe('GET /api/v1/bilan-section-instances', () => {
  it('returns instances from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', contentNotes: {} } as InstanceStub,
    ]);

    const res = await request(app)
      .get('/api/v1/bilan-section-instances')
      .query({ bilanId: '00000000-0000-0000-0000-000000000001' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith(
      'demo-user',
      '00000000-0000-0000-0000-000000000001',
      undefined,
      false,
    );
  });
});

