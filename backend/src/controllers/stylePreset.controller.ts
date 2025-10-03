import type { Request, Response, NextFunction } from 'express';
import { StylePresetService } from '../services/stylePreset.service';

export const StylePresetController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const target = req.query.target as 'TITLE' | 'SUBTITLE' | 'PARAGRAPH' | undefined;
      const includeArchived = req.query.includeArchived === 'true';
      const items = await StylePresetService.list({ target, includeArchived });
      res.json(items);
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { created, preset } = await StylePresetService.createOrGet(req.body);
      res.status(created ? 201 : 200).json({ created, preset });
    } catch (e) {
      next(e);
    }
  },
};

