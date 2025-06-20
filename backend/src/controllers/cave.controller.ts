import type { Request, Response, NextFunction } from 'express';
import { CaveService } from '../services/cave.service';

export const CaveController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const cave = await CaveService.create(req.body);
      res.status(201).json(cave);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const bienId = req.query.bienId as string | undefined;
      const caves = await CaveService.list(bienId);
      res.json(caves);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const cave = await CaveService.get(req.params.id);
      if (!cave) {
        res.sendStatus(404);
        return;
      }
      res.json(cave);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cave = await CaveService.update(req.params.id, req.body);
      res.json(cave);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await CaveService.remove(req.params.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
