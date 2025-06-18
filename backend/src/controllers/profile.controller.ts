import type { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';

export const ProfileController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.create(req.user.id, req.body);
      res.status(201).json(profile);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ProfileService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.get(req.params.profileId, req.user.id);
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
      const profile = await ProfileService.update(
        req.params.profileId,
        req.user.id,
        req.body
      );
      res.json(profile);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ProfileService.remove(req.params.profileId, req.user.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
