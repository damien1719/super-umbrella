import request from 'supertest';
import app from '../src/app';
import { GarantService } from '../src/services/garant.service';

interface GarantStub {
  id: number;
  type: string;
}

jest.mock('../src/services/garant.service');

const mockedService = GarantService as jest.Mocked<typeof GarantService>;

describe('GET /api/v1/garants', () => {
  it('returns garants from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: 1, type: 'AUTRE' } as GarantStub,
    ]);

    const res = await request(app).get('/api/v1/garants');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalled();
  });
});

describe('POST /api/v1/garants', () => {
  it('creates a garant via service', async () => {
    const payload = {
      locataireId: '00000000-0000-0000-0000-000000000000',
      type: 'AUTRE',
    };
    (mockedService.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      type: 'AUTRE',
    } as GarantStub);

    const res = await request(app).post('/api/v1/garants').send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith(payload.locataireId, { type: 'AUTRE' });
  });
});
