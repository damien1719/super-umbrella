import type { Request, Response, NextFunction } from 'express';
import { FiscalService } from '../services/fiscal.service';

export const FiscalController = {
  async result(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const data = await FiscalService.compute({ anneeId, activityId });
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
};
