import request from 'supertest';
import app from '../src/app';
import { CaveService } from '../src/services/cave.service';

interface CaveStub {
  id: string;
  no: string;
}

jest.mock('../src/services/cave.service');

const mockedService = CaveService as jest.Mocked<typeof CaveService>;

describe('GET /api/v1/caves', () => {
  it('returns caves from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', no: 'C1' } as CaveStub,
    ]);

    const res = await request(app).get('/api/v1/caves');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith(undefined);
  });
});

describe('POST /api/v1/caves', () => {
  it('creates a cave via service', async () => {
    const payload = {
      bienId: '00000000-0000-0000-0000-000000000000',
      no: 'C1',
      niveau: 1,
    };
    (mockedService.create as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...payload,
    } as CaveStub);

    const res = await request(app).post('/api/v1/caves').send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith(payload);
  });
});
