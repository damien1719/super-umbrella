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
