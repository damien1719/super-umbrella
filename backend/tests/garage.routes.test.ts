import request from 'supertest';
import app from '../src/app';
import { GarageService } from '../src/services/garage.service';

interface GarageStub {
  id: string;
  no: string;
}

jest.mock('../src/services/garage.service');

const mockedService = GarageService as jest.Mocked<typeof GarageService>;

describe('GET /api/v1/garages', () => {
  it('returns garages from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', no: 'G1' } as GarageStub,
    ]);

    const res = await request(app).get('/api/v1/garages');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith(undefined);
  });
});

describe('POST /api/v1/garages', () => {
  it('creates a garage via service', async () => {
    const payload = {
      bienId: '00000000-0000-0000-0000-000000000000',
      no: 'G1',
      niveau: 1,
    };
    (mockedService.create as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...payload,
    } as GarageStub);

    const res = await request(app).post('/api/v1/garages').send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith(payload);
  });
});
