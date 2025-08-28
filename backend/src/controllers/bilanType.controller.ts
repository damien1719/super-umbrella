import type { Request, Response, NextFunction } from 'express';
import { BilanTypeService } from '../services/bilanType.service';

export const BilanTypeController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bilanType = await BilanTypeService.create(req.user.id, req.body);
      res.status(201).json(bilanType);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await BilanTypeService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bilanType = await BilanTypeService.get(req.user.id, req.params.bilanTypeId);
      if (!bilanType) {
        res.sendStatus(404);
        return;
      }
      res.json(bilanType);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bilanType = await BilanTypeService.update(
        req.user.id,
        req.params.bilanTypeId,
        req.body,
      );
      res.json(bilanType);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanTypeService.remove(req.user.id, req.params.bilanTypeId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};

