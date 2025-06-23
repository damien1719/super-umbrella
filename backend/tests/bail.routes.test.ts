import request from 'supertest';
import app from '../src/app';
import { BailService } from '../src/services/bail.service';

jest.mock('../src/services/bail.service');

const mockedService = BailService as jest.Mocked<typeof BailService>;

describe('GET /api/v1/bails/location-meublee', () => {
  it('returns docx from service', async () => {
    mockedService.generate.mockResolvedValueOnce(Buffer.from('docx'));
    const res = await request(app).get('/api/v1/bails/location-meublee?bailleurNom=Test&bailleurPrenom=John');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(mockedService.generate).toHaveBeenCalledWith({ bailleurNom: 'Test', bailleurPrenom: 'John' });
  });
});
