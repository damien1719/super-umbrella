import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { validate } from '../middlewares/validate.middleware';
import { reportQuerySchema } from '../schemas/report.schema';

export const reportRouter = Router();

reportRouter.get('/pdf', validate(reportQuerySchema), ReportController.exportPdf);
