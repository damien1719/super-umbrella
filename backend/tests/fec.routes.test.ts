import request from 'supertest';
import app from '../src/app';
import { FecService } from '../src/services/fec.service';

jest.mock('../src/services/fec.service');

const mockedService = FecService as jest.Mocked<typeof FecService>;

describe('GET /api/v1/fec', () => {
  it('returns content from service', async () => {
    mockedService.generate.mockResolvedValueOnce('line1');
    const res = await request(app).get('/api/v1/fec?anneeId=1&activityId=1');
    expect(res.status).toBe(200);
    expect(res.text).toBe('line1');
    expect(mockedService.generate).toHaveBeenCalledWith({ anneeId: 1n, activityId: 1n });
  });
});
