import type { Request, Response, NextFunction } from 'express';
import { BilanSectionInstanceService } from '../services/bilanSectionInstance.service';

export const BilanSectionInstanceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const instance = await BilanSectionInstanceService.create(req.user.id, req.body);
      res.status(201).json(instance);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { bilanId } = req.query as { bilanId: string };
      const instances = await BilanSectionInstanceService.list(req.user.id, bilanId);
      res.json(instances);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const instance = await BilanSectionInstanceService.get(
        req.user.id,
        req.params.bilanSectionInstanceId,
      );
      if (!instance) {
        res.sendStatus(404);
        return;
      }
      res.json(instance);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const instance = await BilanSectionInstanceService.update(
        req.user.id,
        req.params.bilanSectionInstanceId,
        req.body,
      );
      res.json(instance);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanSectionInstanceService.remove(
        req.user.id,
        req.params.bilanSectionInstanceId,
      );
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};

