import type { Request, Response, NextFunction } from 'express';
import { FiscalService } from '../services/fiscal.service';

export const FiscalController = {
  async result(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const data = await FiscalService.compute({ anneeId, activityId });
      const safe = JSON.parse(
        JSON.stringify(data, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );
      res.json(safe);
    } catch (e) {
      next(e);
    }
  },
};
