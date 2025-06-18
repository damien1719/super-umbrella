import { Router } from 'express';
import { ArticleController } from '../controllers/article.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdParam,
} from '../schemas/article.schema';

export const articleRouter = Router();

articleRouter
  .route('/')
  .post(validateBody(createArticleSchema), ArticleController.create)
  .get(ArticleController.list);

articleRouter
  .route('/:id')
  .get(validateParams(articleIdParam), ArticleController.get)
  .patch(
    validateParams(articleIdParam),
    validateBody(updateArticleSchema),
    ArticleController.update,
  )
  .delete(validateParams(articleIdParam), ArticleController.remove);
