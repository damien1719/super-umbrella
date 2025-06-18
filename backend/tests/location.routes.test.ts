import request from 'supertest';
import app from '../src/app';
import { LocationService } from '../src/services/location.service';

interface LocationStub {
  id: string;
  baseRent: number;
}

jest.mock('../src/services/location.service');

const mockedService = LocationService as jest.Mocked<typeof LocationService>;

describe('GET /api/v1/locations', () => {
  it('returns locations from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', baseRent: 500 } as LocationStub,
    ]);

    const res = await request(app).get('/api/v1/locations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
