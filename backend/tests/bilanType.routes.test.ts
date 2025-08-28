import request from 'supertest';
import app from '../src/app';
import { BilanTypeService } from '../src/services/bilanType.service';

jest.mock('../src/services/bilanType.service');

interface BilanTypeStub {
  id: string;
  name: string;
}

const mockedService = BilanTypeService as jest.Mocked<typeof BilanTypeService>;

describe('GET /api/v1/bilan-types', () => {
  it('returns bilan types from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', name: 'BT' } as BilanTypeStub,
    ]);

    const res = await request(app).get('/api/v1/bilan-types');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});

describe('POST /api/v1/bilan-types', () => {
  it('creates a bilan type using the service', async () => {
    const body = { name: 'BT' };
    mockedService.create.mockResolvedValueOnce({
      id: '2',
      name: 'BT',
    } as BilanTypeStub);

    const res = await request(app).post('/api/v1/bilan-types').send(body);
    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith('demo-user', body);
  });
});

