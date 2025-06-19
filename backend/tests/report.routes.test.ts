import request from 'supertest';
import app from '../src/app';
import { ReportService } from '../src/services/report.service';

jest.mock('../src/services/report.service');

const mockedService = ReportService as jest.Mocked<typeof ReportService>;

describe('GET /api/v1/reports/pdf', () => {
  it('returns pdf from service', async () => {
    mockedService.generate.mockResolvedValueOnce(Buffer.from('pdf'));
    const res = await request(app).get('/api/v1/reports/pdf?anneeId=1&activityId=1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(mockedService.generate).toHaveBeenCalledWith({ anneeId: 1n, activityId: 1n });
  });
});
