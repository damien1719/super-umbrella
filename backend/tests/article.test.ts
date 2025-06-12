import request from 'supertest';
import app from '../src/app';
import { ArticleService } from '../src/services/article.service';

jest.mock('../src/services/article.service');
const mockedService = jest.mocked(ArticleService);

describe('Article routes', () => {
  afterEach(() => jest.resetAllMocks());

  it('creates an article', async () => {
    const article = { id: 1, masked: false, prTexte: 'test', dureeMini: 1, dureeMaxi: 2 };
    mockedService.create.mockResolvedValue(article as any);

    const res = await request(app)
      .post('/api/v1/articles')
      .send({ masked: false, prTexte: 'test', dureeMini: 1, dureeMaxi: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(article);
  });

  it('lists articles', async () => {
    const articles = [{ id: 1 }];
    mockedService.list.mockResolvedValue(articles as any);

    const res = await request(app).get('/api/v1/articles');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(articles);
  });
});
