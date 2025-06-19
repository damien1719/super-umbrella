import request from 'supertest';
import app from '../src/app';
import { LocataireService } from '../src/services/locataire.service';

interface LocataireStub {
  id: string;
  nom: string;
}

jest.mock('../src/services/locataire.service');

const mockedService = LocataireService as jest.Mocked<typeof LocataireService>;

describe('GET /api/v1/locataires', () => {
  it('returns locataires from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', nom: 'Doe' } as LocataireStub,
    ]);

    const res = await request(app).get('/api/v1/locataires');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/v1/locataires/properties/:id/locataires', () => {
  it('returns locataires for property', async () => {
    (mockedService.listForProperty as jest.Mock).mockResolvedValueOnce([
      { id: '1', nom: 'Doe' } as LocataireStub,
    ]);

    const id = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(
      `/api/v1/locataires/properties/${id}/locataires`,
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/v1/locataires', () => {
  it('creates a locataire via service', async () => {
    const payload = {
      prenom: 'John',
      nom: 'Doe',
      civilite: 'MR',
      dateNaissance: '1990-01-01',
      bienId: '00000000-0000-0000-0000-000000000000',
      locationId: '11111111-1111-1111-1111-111111111111',
    };
    (mockedService.create as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...payload,
    } as LocataireStub);

    const res = await request(app).post('/api/v1/locataires').send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith({
      ...payload,
      dateNaissance: new Date('1990-01-01'),
    });
  });
});
