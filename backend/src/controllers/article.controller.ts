import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/article.service';

export const ArticleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.create(req.body);
      res.status(201).json(article);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ArticleService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.get(BigInt(req.params.id));
      if (!article) return res.sendStatus(404);
      res.json(article);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleService.update(
        BigInt(req.params.id),
        req.body,
      );
      res.json(article);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ArticleService.remove(BigInt(req.params.id));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
