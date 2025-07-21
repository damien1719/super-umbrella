import request from 'supertest';
import app from '../src/app';
import { PatientService } from '../src/services/patient.service';

jest.mock('../src/services/patient.service');

interface PatientStub {
  id: string;
  firstName: string;
}

const mockedService = PatientService as jest.Mocked<typeof PatientService>;

describe('GET /api/v1/patients', () => {
  it('returns patients from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', firstName: 'Alice' } as PatientStub,
    ]);

    const res = await request(app).get('/api/v1/patients');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});
