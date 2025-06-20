import type { Request, Response, NextFunction } from 'express';
import { GarantService } from '../services/garant.service';

export const GarantController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { locataireId, ...data } = req.body;
      const garant = await GarantService.create(locataireId, data);
      res.status(201).json(garant);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const garants = await GarantService.list();
      res.json(garants);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const garant = await GarantService.get(Number(req.params.id));
      if (!garant) {
        res.sendStatus(404);
        return;
      }
      res.json(garant);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const garant = await GarantService.update(Number(req.params.id), req.body);
      res.json(garant);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await GarantService.remove(Number(req.params.id));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
