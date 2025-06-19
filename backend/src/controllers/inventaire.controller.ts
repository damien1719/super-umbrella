import type { Request, Response, NextFunction } from 'express';
import { InventaireService } from '../services/inventaire.service';

export const InventaireController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const inv = await InventaireService.create(req.body);
      res.status(201).json(inv);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const bienId = req.query.bienId as string | undefined;
      const invs = await InventaireService.list(bienId);
      res.json(invs);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const inv = await InventaireService.get(req.params.id);
      if (!inv) {
        res.sendStatus(404);
        return;
      }
      res.json(inv);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const inv = await InventaireService.update(req.params.id, req.body);
      res.json(inv);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await InventaireService.remove(req.params.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
