import { Router } from 'express';
import { AmortissementController } from '../controllers/amortissement.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { amortissementQuerySchema } from '../schemas/amortissement.schema';

export const amortissementRouter = Router();

amortissementRouter.get(
  '/',
  validateQuery(amortissementQuerySchema),
  AmortissementController.compute,
);
