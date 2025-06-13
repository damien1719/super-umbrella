import type { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';

export const ReportController = {
  async exportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const anneeId = BigInt(req.query.anneeId as string);
      const activityId = BigInt(req.query.activityId as string);
      const pdf = await ReportService.generate({ anneeId, activityId });
      res
        .status(200)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="report.pdf"',
        })
        .send(pdf);
    } catch (e) {
      next(e);
    }
  },
};
