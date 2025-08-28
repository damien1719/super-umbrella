import request from 'supertest';
import app from '../src/app';
import { BilanTypeSectionService } from '../src/services/bilanTypeSection.service';

jest.mock('../src/services/bilanTypeSection.service');

interface BilanTypeSectionStub {
  id: string;
  bilanTypeId: string;
  sectionId: string;
  sortOrder: number;
}

const mockedService = BilanTypeSectionService as jest.Mocked<typeof BilanTypeSectionService>;

describe('GET /api/v1/bilan-type-sections', () => {
  it('returns relations from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', bilanTypeId: 'bt', sectionId: 'sec', sortOrder: 1 } as BilanTypeSectionStub,
    ]);

    const res = await request(app).get('/api/v1/bilan-type-sections');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});

describe('POST /api/v1/bilan-type-sections', () => {
  it('creates a relation using the service', async () => {
    const body = {
      bilanTypeId: '11111111-1111-1111-1111-111111111111',
      sectionId: '22222222-2222-2222-2222-222222222222',
      sortOrder: 1,
    };
    mockedService.create.mockResolvedValueOnce({ id: '2', ...body } as BilanTypeSectionStub);

    const res = await request(app).post('/api/v1/bilan-type-sections').send(body);
    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith('demo-user', body);
  });
});
