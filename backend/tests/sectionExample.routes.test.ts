import request from 'supertest';
import app from '../src/app';
import { SectionExampleService } from '../src/services/sectionExample.service';

jest.mock('../src/services/sectionExample.service');

interface ExampleStub {
  id: string;
  content: string;
}

const mockedService = SectionExampleService as jest.Mocked<typeof SectionExampleService>;

describe('GET /api/v1/section-examples', () => {
  it('returns examples from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', content: 'demo' } as ExampleStub,
    ]);

    const res = await request(app).get('/api/v1/section-examples');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith('demo-user');
  });
});
