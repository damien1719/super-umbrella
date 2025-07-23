import type { Request, Response, NextFunction } from 'express';
import { SectionExampleService } from '../services/sectionExample.service';

export const SectionExampleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const example = await SectionExampleService.create(req.user.id, req.body);
      res.status(201).json(example);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await SectionExampleService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const example = await SectionExampleService.get(
        req.user.id,
        req.params.sectionExampleId,
      );
      if (!example) {
        res.sendStatus(404);
        return;
      }
      res.json(example);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const example = await SectionExampleService.update(
        req.user.id,
        req.params.sectionExampleId,
        req.body,
      );
      res.json(example);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await SectionExampleService.remove(req.user.id, req.params.sectionExampleId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
