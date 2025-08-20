import request from 'supertest';
import app from '../src/app';
import { SectionTemplateService } from '../src/services/sectionTemplate.service';

jest.mock('../src/services/sectionTemplate.service');

interface TemplateStub {
  id: string;
  label: string;
}

const mockedService = SectionTemplateService as jest.Mocked<typeof SectionTemplateService>;

describe('GET /api/v1/section-templates', () => {
  it('returns templates from service', async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: '1', label: 'Temp' } as TemplateStub,
    ]);

    const res = await request(app).get('/api/v1/section-templates');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalled();
  });
});
