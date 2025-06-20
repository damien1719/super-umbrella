import { Router } from 'express';
import { GarantController } from '../controllers/garant.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createGarantSchema,
  updateGarantSchema,
  garantIdParam,
} from '../schemas/garant.schema';

export const garantRouter = Router();

garantRouter
  .route('/')
  .post(validateBody(createGarantSchema), GarantController.create)
  .get(GarantController.list);

garantRouter
  .route('/:id')
  .get(validateParams(garantIdParam), GarantController.get)
  .patch(
    validateParams(garantIdParam),
    validateBody(updateGarantSchema),
    GarantController.update,
  )
  .delete(validateParams(garantIdParam), GarantController.remove);
