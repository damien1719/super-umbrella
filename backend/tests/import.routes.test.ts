import request from 'supertest';
import app from '../src/app';
import { generateText } from '../src/services/ai/generate.service';

jest.mock('../src/services/ai/generate.service');

const mockedGenerate = generateText as jest.MockedFunction<typeof generateText>;

describe('POST /api/v1/import/transform', () => {
  it('calls ai service with content', async () => {
    mockedGenerate.mockResolvedValueOnce('["q1"]');
    const res = await request(app)
      .post('/api/v1/import/transform')
      .send({ content: 'txt' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ result: ['q1'] });
    expect(mockedGenerate).toHaveBeenCalledWith({
      instructions: 'transforme en liste de questions',
      userContent: 'txt',
    });
  });
});
