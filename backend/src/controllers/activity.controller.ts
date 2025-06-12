import type { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';

export const ActivityController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await ActivityService.create(req.body);
      res.status(201).json(activity);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ActivityService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await ActivityService.get(BigInt(req.params.id));
      if (!activity) {
        res.sendStatus(404);
        return;
      }
      res.json(activity);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await ActivityService.update(
        BigInt(req.params.id),
        req.body,
      );
      res.json(activity);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ActivityService.remove(BigInt(req.params.id));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
