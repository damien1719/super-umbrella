import request from 'supertest';
import app from '../src/app';
import { ProfileService } from '../src/services/profile.service';
jest.mock('../src/services/profile.service');
const mockedService = ProfileService;
describe('GET /api/v1/profile', () => {
    it('returns profiles from service', async () => {
        mockedService.list.mockResolvedValueOnce([
            { id: 1, prTexte: 'Prof' },
        ]);
        const res = await request(app).get('/api/v1/profile');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(mockedService.list).toHaveBeenCalledWith('demo-user');
    });
});
