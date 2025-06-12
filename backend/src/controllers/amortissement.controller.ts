import type { Request, Response, NextFunction } from 'express';
import { AmortissementService } from '../services/amortissement.service';

export const AmortissementController = {
  async compute(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const data = await AmortissementService.compute({ anneeId, activityId });
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
};
