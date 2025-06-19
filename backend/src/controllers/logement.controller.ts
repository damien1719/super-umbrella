import type { Request, Response, NextFunction } from 'express';
import { LogementService } from '../services/logement.service';

export const LogementController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const logement = await LogementService.create(req.body);
      res.status(201).json(logement);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await LogementService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const logement = await LogementService.get(BigInt(req.params.id));
      if (!logement) {
        res.sendStatus(404);
        return;
      }
      res.json(logement);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const logement = await LogementService.update(BigInt(req.params.id), req.body);
      res.json(logement);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await LogementService.remove(BigInt(req.params.id));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
