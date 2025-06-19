import request from 'supertest';
import app from '../src/app';
import { ProfileService } from '../src/services/profile.service';

interface ProfileStub {
  id: number;
  prTexte: string;
}

jest.mock('../src/services/profile.service');

const mockedService = ProfileService as jest.Mocked<typeof ProfileService>;

describe('GET /api/v1/profile', () => {
  it('returns profiles from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: 1, prTexte: 'Prof' } as ProfileStub,
    ]);

    const res = await request(app).get('/api/v1/profile');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});
