import request from 'supertest';
import app from '../src/app';
import { CerfaService } from '../src/services/cerfa.service';

jest.mock('../src/services/cerfa.service');

const mockedService = CerfaService as jest.Mocked<typeof CerfaService>;

describe('GET /api/v1/cerfa/2031-sd', () => {
  it('returns pdf from service', async () => {
    mockedService.generate2031.mockResolvedValueOnce(Buffer.from('pdf'));
    const res = await request(app).get(
      '/api/v1/cerfa/2031-sd?anneeId=1&activityId=1'
    );
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(mockedService.generate2031).toHaveBeenCalledWith({
      anneeId: 1n,
      activityId: 1n,
    });
  });
});

describe('GET /api/v1/cerfa/2042', () => {
  it('returns pdf from service', async () => {
    mockedService.generate2042.mockResolvedValueOnce(Buffer.from('pdf'));
    const res = await request(app).get(
      '/api/v1/cerfa/2042?anneeId=1&activityId=1'
    );
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(mockedService.generate2042).toHaveBeenCalledWith({
      anneeId: 1n,
      activityId: 1n,
    });
  });
});
