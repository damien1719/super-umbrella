import type { Request, Response, NextFunction } from 'express';
import { LocataireService } from '../services/locataire.service';

export const LocataireController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const loc = await LocataireService.create(req.body);
      res.status(201).json(loc);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const locs = await LocataireService.list();
      res.json(locs);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const loc = await LocataireService.get(req.params.locataireId);
      if (!loc) {
        res.sendStatus(404);
        return;
      }
      res.json(loc);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const loc = await LocataireService.update(req.params.locataireId, req.body);
      res.json(loc);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await LocataireService.remove(req.params.locataireId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },

  async listForProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const locs = await LocataireService.listForProperty(
        req.user.id,
        req.params.bienId,
      );
      res.json(locs);
    } catch (e) {
      next(e);
    }
  },
};
