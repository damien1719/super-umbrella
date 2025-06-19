import request from 'supertest';
import app from '../src/app';
import { InventaireService } from '../src/services/inventaire.service';

interface InventaireStub {
  id: string;
  bienId: string;
  piece: string;
  mobilier: string;
}

jest.mock('../src/services/inventaire.service');

const mockedService = InventaireService as jest.Mocked<typeof InventaireService>;

describe('GET /api/v1/inventaires', () => {
  it('returns inventaires from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', bienId: 'b1', piece: 'Salon', mobilier: 'TABLE' } as InventaireStub,
    ]);

    const res = await request(app).get('/api/v1/inventaires');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith(undefined);
  });
});

describe('POST /api/v1/inventaires', () => {
  it('creates an inventaire via service', async () => {
    const payload = {
      bienId: '00000000-0000-0000-0000-000000000000',
      piece: 'Chambre',
      mobilier: 'LIT',
    };
    (mockedService.create as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...payload,
    } as InventaireStub);

    const res = await request(app).post('/api/v1/inventaires').send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith(payload);
  });
});
