import type { Request, Response, NextFunction } from 'express';
import { SectionService } from '../services/section.service';

export const SectionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await SectionService.create(req.user.id, req.body);
      res.status(201).json(section);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await SectionService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await SectionService.get(req.user.id, req.params.sectionId);
      if (!section) {
        res.sendStatus(404);
        return;
      }
      res.json(section);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const section = await SectionService.update(
        req.user.id,
        req.params.sectionId,
        req.body,
      );
      res.json(section);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await SectionService.remove(req.user.id, req.params.sectionId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
