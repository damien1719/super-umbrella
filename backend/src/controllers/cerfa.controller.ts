import type { Request, Response, NextFunction } from 'express';
import { CerfaService } from '../services/cerfa.service';

export const CerfaController = {
  async generate2031(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const pdf = await CerfaService.generate2031({ anneeId, activityId });
      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="2031-sd.pdf"',
        })
        .send(pdf);
    } catch (e) {
      next(e);
    }
  },

  async generate2033(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const pdf = await CerfaService.generate2033({ anneeId, activityId });
      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="2033-sd_5015 (1).pdf"',
        })
        .send(pdf);
    } catch (e) {
      next(e);
    }
  },

  async generate2042(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const pdf = await CerfaService.generate2042({ anneeId, activityId });
      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="2042_5124.pdf"',
        })
        .send(pdf);
    } catch (e) {
      next(e);
    }
  },
};
