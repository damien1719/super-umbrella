import { Router } from 'express';
import { FecController } from '../controllers/fec.controller';
import { validate } from '../middlewares/validate.middleware';
import { fecQuerySchema } from '../schemas/fec.schema';

export const fecRouter = Router();

fecRouter.get('/', validate(fecQuerySchema), FecController.export);
