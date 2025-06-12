import request from 'supertest';
import app from '../src/app';
import { ArticleService } from '../src/services/article.service';
interface Article {
  id: number;
  masked: boolean;
  mnem: string | null;
  prTexte: string;
  dureeMini: number;
  dureeMaxi: number;
}

jest.mock('../src/services/article.service');
const mockedService = jest.mocked(ArticleService);

const sampleArticle: Article = {
  id: 1,
  masked: false,
  mnem: null,
  prTexte: 'test',
  dureeMini: 1,
  dureeMaxi: 2,
};

describe('Article routes', () => {
  afterEach(() => jest.resetAllMocks());

  it('creates an article', async () => {
    mockedService.create.mockResolvedValue(sampleArticle as unknown as object);

    const res = await request(app)
      .post('/api/v1/articles')
      .send({ masked: false, prTexte: 'test', dureeMini: 1, dureeMaxi: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(sampleArticle);
  });

  it('lists articles', async () => {
    const articles: Article[] = [sampleArticle];
    mockedService.list.mockResolvedValue(articles as unknown as never[]);

    const res = await request(app).get('/api/v1/articles');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(articles);
  });
});
