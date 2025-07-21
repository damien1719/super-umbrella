import type { Request, Response, NextFunction } from "express";
import { BilanService } from "../services/bilan.service";
import { sanitizeHtml } from "../utils/sanitize";

export const BilanController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.create(req.user.id, req.body);
      res.status(201).json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await BilanService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.get(req.user.id, req.params.bilanId);
      if (!bilan) {
        res.sendStatus(404);
        return;
      }
      res.json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.descriptionHtml) {
        req.body.descriptionHtml = sanitizeHtml(req.body.descriptionHtml);
      }
      const bilan = await BilanService.update(
        req.user.id,
        req.params.bilanId,
        req.body,
      );
      res.json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanService.remove(req.user.id, req.params.bilanId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
