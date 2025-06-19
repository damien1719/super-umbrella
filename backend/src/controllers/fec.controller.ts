import type { Request, Response, NextFunction } from 'express';
import { FecService } from '../services/fec.service';

export const FecController = {
  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const content = await FecService.generate({ anneeId, activityId });
      res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
      res.setHeader('Content-Disposition', 'attachment; filename="fec.txt"');
      res.send(content);
    } catch (e) {
      next(e);
    }
  },
};
