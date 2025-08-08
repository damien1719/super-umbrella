import request from 'supertest';
import app from '../src/app';
import { SectionService } from '../src/services/section.service';

jest.mock('../src/services/section.service');

interface SectionStub {
  id: string;
  title: string;
}

const mockedService = SectionService as jest.Mocked<typeof SectionService>;

describe('GET /api/v1/sections', () => {
  it('returns sections from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', title: 'Sec' } as SectionStub,
    ]);

    const res = await request(app).get('/api/v1/sections');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});

describe('POST /api/v1/sections/:id/duplicate', () => {
  it('duplicates a section using the service', async () => {
    mockedService.duplicate.mockResolvedValueOnce({
      id: '2',
      title: 'Sec copy',
    } as SectionStub);

    const res = await request(app).post('/api/v1/sections/1/duplicate');
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('2');
    expect(mockedService.duplicate).toHaveBeenCalledWith('demo-user', '1');
  });
});
