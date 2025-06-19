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

describe('POST /api/v1/locations/properties/:id/location', () => {
  it('creates a location via service', async () => {
    const bienId = '00000000-0000-0000-0000-000000000000';
    const payload = {
      baseRent: 600,
      leaseStartDate: '2024-01-01',
      signatureCopies: 1,
      previousSituation: 'FIRST_TIME',
    };
    (mockedService.createForProperty as jest.Mock).mockResolvedValueOnce({
      id: '1',
      baseRent: 600,
    } as LocationStub);

    const res = await request(app)
      .post(`/api/v1/locations/properties/${bienId}/location`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.createForProperty).toHaveBeenCalledWith(
      'demo-user',
      bienId,
      {
        ...payload,
        leaseStartDate: new Date('2024-01-01'),
      },
    );
  });
});
