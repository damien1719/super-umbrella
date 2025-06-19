import { Router } from 'express';
import { FecController } from '../controllers/fec.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { fecQuerySchema } from '../schemas/fec.schema';

export const fecRouter = Router();

fecRouter.get('/', validateQuery(fecQuerySchema), FecController.export);
