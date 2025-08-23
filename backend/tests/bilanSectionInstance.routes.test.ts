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

describe('POST /api/v1/bilan-section-instances/upsert', () => {
  it('delegates to service and returns id', async () => {
    mockedService.upsert.mockResolvedValueOnce({ id: 'abc' } as InstanceStub);

    const res = await request(app)
      .post('/api/v1/bilan-section-instances/upsert')
      .send({
        bilanId: '00000000-0000-0000-0000-000000000001',
        sectionId: '00000000-0000-0000-0000-000000000002',
        contentNotes: {},
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'abc' });
    expect(mockedService.upsert).toHaveBeenCalledWith('demo-user', {
      bilanId: '00000000-0000-0000-0000-000000000001',
      sectionId: '00000000-0000-0000-0000-000000000002',
      contentNotes: {},
    });
  });
});

