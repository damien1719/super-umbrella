import { Router } from 'express';
import { FiscalController } from '../controllers/fiscal.controller';
import { validate } from '../middlewares/validate.middleware';
import { fiscalQuerySchema } from '../schemas/fiscal.schema';

export const fiscalRouter = Router();

fiscalRouter.get('/result', validate(fiscalQuerySchema), FiscalController.result);
