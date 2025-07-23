import request from 'supertest';
import app from '../src/app';

describe('GET /api/bilans/:id/sections', () => {
  it('returns list of sections', async () => {
    const res = await request(app).get('/api/bilans/1/sections');
    expect(res.status).toBe(200);
    expect(res.body.sections.length).toBeGreaterThan(0);
    expect(res.body.sections[0]).toHaveProperty('title');
  });
});
