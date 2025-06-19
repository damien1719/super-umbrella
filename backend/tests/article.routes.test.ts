import request from 'supertest';
import app from '../src/app';
import { ArticleService } from '../src/services/article.service';

interface ArticleStub {
  id: number;
  masked: boolean;
  mnem: string | null;
  prTexte: string;
  dureeMini: number;
  dureeMaxi: number;
}

jest.mock('../src/services/article.service');

const mockedService = ArticleService as jest.Mocked<typeof ArticleService>;

describe('GET /api/v1/articles', () => {
  it('returns articles from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: 1, masked: false, mnem: null, prTexte: 'A', dureeMini: 1, dureeMaxi: 2 } as ArticleStub,
    ]);

    const res = await request(app).get('/api/v1/articles');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
