import type { Request, Response, NextFunction } from 'express';
import { BilanTypeShareService } from '../services/bilanTypeShare.service';

export const BilanTypeShareController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role } = req.body as { email: string; role?: 'VIEWER' | 'EDITOR' };
      const out = await BilanTypeShareService.create(req.user.id, req.params.bilanTypeId, email, role);
      res.status(201).json(out);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const out = await BilanTypeShareService.list(req.user.id, req.params.bilanTypeId);
      res.json(out);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanTypeShareService.remove(req.user.id, req.params.bilanTypeId, req.params.shareId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};

