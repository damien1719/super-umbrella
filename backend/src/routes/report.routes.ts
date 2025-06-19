import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { reportQuerySchema } from '../schemas/report.schema';

export const reportRouter = Router();

reportRouter.get(
  '/pdf',
  validateQuery(reportQuerySchema),
  ReportController.exportPdf,
);
