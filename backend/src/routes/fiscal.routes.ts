import { Router } from 'express';
import { FiscalController } from '../controllers/fiscal.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { fiscalQuerySchema } from '../schemas/fiscal.schema';

export const fiscalRouter = Router();

fiscalRouter.get(
  '/result',
  validateQuery(fiscalQuerySchema),
  FiscalController.result,
);
