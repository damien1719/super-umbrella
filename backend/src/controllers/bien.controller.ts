import type { Request, Response, NextFunction } from 'express';
import { BienService } from '../services/bien.service';

export const BienController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bien = await BienService.create(req.body);
      res.status(201).json(bien);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await BienService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bien = await BienService.get(req.params.id);
      if (!bien) {
        res.sendStatus(404);
        return;
      }
      res.json(bien);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bien = await BienService.update(req.params.id, req.body);
      res.json(bien);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BienService.remove(req.params.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
