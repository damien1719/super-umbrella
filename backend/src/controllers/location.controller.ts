import type { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/location.service';

export const LocationController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { profileId, bienId } = req.query as {
        profileId?: string;
        bienId?: string;
      };
      const locations = await LocationService.list(req.user.id, {
        profileId,
        bienId,
      });
      res.json(locations);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.get(req.user.id, req.params.locId);
      res.json(location);
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.create(req.user.id, req.body);
      res.status(201).json(location);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.update(
        req.user.id,
        req.params.locId,
        req.body,
      );
      res.json(location);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await LocationService.remove(req.user.id, req.params.locId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },

  async getByProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.getByProperty(
        req.user.id,
        req.params.id,
      );
      res.json(location);
    } catch (e) {
      next(e);
    }
  },

  async createForProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.createForProperty(
        req.user.id,
        req.params.id,
        req.body,
      );
      res.status(201).json(location);
    } catch (e) {
      next(e);
    }
  },

  async listForProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await LocationService.listForProfile(
        req.user.id,
        req.params.profileId,
      );
      res.json(locations);
    } catch (e) {
      next(e);
    }
  },

  async createForProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await LocationService.createForProfile(
        req.user.id,
        req.params.profileId,
        req.body,
      );
      res.status(201).json(location);
    } catch (e) {
      next(e);
    }
  },
};
