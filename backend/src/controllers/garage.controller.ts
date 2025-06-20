import type { Request, Response, NextFunction } from 'express';
import { GarageService } from '../services/garage.service';

export const GarageController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const garage = await GarageService.create(req.body);
      res.status(201).json(garage);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const bienId = req.query.bienId as string | undefined;
      const garages = await GarageService.list(bienId);
      res.json(garages);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const garage = await GarageService.get(req.params.id);
      if (!garage) {
        res.sendStatus(404);
        return;
      }
      res.json(garage);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const garage = await GarageService.update(req.params.id, req.body);
      res.json(garage);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await GarageService.remove(req.params.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
