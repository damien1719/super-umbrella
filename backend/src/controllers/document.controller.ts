import type { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';

export const DocumentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await DocumentService.create(req.body);
      res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await DocumentService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await DocumentService.get(req.params.id);
      if (!doc) {
        res.sendStatus(404);
        return;
      }
      res.json(doc);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await DocumentService.update(req.params.id, req.body);
      res.json(doc);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentService.remove(req.params.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
