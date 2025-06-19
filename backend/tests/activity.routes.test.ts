import request from 'supertest';
import app from '../src/app';
import { ActivityService } from '../src/services/activity.service';

interface ActivityStub {
  id: number;
  prTexte: string;
}

jest.mock('../src/services/activity.service');

const mockedService = ActivityService as jest.Mocked<typeof ActivityService>;

describe('GET /api/v1/activities', () => {
  it('returns activities from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: 1, prTexte: 'Act' } as ActivityStub,
    ]);

    const res = await request(app).get('/api/v1/activities');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

