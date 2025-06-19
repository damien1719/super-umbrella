import type { Request, Response, NextFunction } from 'express';
import { OperationService } from '../services/operation.service';

export const OperationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const operation = await OperationService.create(req.body);
      res.status(201).json(operation);
    } catch (e) {
      next(e);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await OperationService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const operation = await OperationService.get(BigInt(req.params.id));
      if (!operation) {
        res.sendStatus(404);
        return;
      }
      res.json(operation);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const operation = await OperationService.update(BigInt(req.params.id), req.body);
      res.json(operation);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await OperationService.remove(BigInt(req.params.id));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
