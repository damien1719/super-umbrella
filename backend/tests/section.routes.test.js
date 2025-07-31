import request from 'supertest';
import app from '../src/app';
import { SectionService } from '../src/services/section.service';
jest.mock('../src/services/section.service');
const mockedService = SectionService;
describe('GET /api/v1/sections', () => {
    it('returns sections from service', async () => {
        mockedService.list.mockResolvedValueOnce([
            { id: '1', title: 'Sec' },
        ]);
        const res = await request(app).get('/api/v1/sections');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(mockedService.list).toHaveBeenCalledWith('demo-user');
    });
});
