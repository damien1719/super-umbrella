import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdParam,
} from '../schemas/article.schema';

export const articleRouter = Router();

articleRouter
  .route('/')
  .post(validate(createArticleSchema), ArticleController.create)
  .get(ArticleController.list);

articleRouter
  .route('/:id')
  .get(validate(articleIdParam), ArticleController.get)
  .patch(validate(updateArticleSchema), ArticleController.update)
  .delete(validate(articleIdParam), ArticleController.remove);
