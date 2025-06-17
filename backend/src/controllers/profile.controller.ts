import type { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';

export const ProfileController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.create(req.body);
      res.status(201).json(profile);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ProfileService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.get(BigInt(req.params.id));
      if (!profile) {
        res.sendStatus(404);
        return;
      }
      res.json(profile);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.update(BigInt(req.params.id), req.body);
      res.json(profile);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.remove(BigInt(req.params.id));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
