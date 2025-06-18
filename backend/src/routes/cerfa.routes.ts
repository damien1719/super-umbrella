import { Router } from 'express';
import { CerfaController } from '../controllers/cerfa.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { cerfa2031QuerySchema, cerfa2033QuerySchema, cerfa2042QuerySchema } from '../schemas/cerfa.schema';

export const cerfaRouter = Router();

cerfaRouter.get(
  '/2031-sd',
  validateQuery(cerfa2031QuerySchema),
  CerfaController.generate2031,
);
cerfaRouter.get(
  '/2033',
  validateQuery(cerfa2033QuerySchema),
  CerfaController.generate2033,
);
cerfaRouter.get(
  '/2042',
  validateQuery(cerfa2042QuerySchema),
  CerfaController.generate2042,
);
