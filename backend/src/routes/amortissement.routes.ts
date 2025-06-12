import { Router } from 'express';
import { AmortissementController } from '../controllers/amortissement.controller';
import { validate } from '../middlewares/validate.middleware';
import { amortissementQuerySchema } from '../schemas/amortissement.schema';

export const amortissementRouter = Router();

amortissementRouter.get('/', validate(amortissementQuerySchema), AmortissementController.compute);
