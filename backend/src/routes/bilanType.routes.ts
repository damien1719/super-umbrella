import { Router } from 'express';
import { BilanTypeController } from '../controllers/bilanType.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createBilanTypeSchema,
  updateBilanTypeSchema,
  bilanTypeIdParam,
} from '../schemas/bilanType.schema';

export const bilanTypeRouter = Router();

bilanTypeRouter
  .route('/')
  .post(validateBody(createBilanTypeSchema), BilanTypeController.create)
  .get(BilanTypeController.list);

bilanTypeRouter
  .route('/:bilanTypeId')
  .get(validateParams(bilanTypeIdParam), BilanTypeController.get)
  .put(
    validateParams(bilanTypeIdParam),
    validateBody(updateBilanTypeSchema),
    BilanTypeController.update,
  )
  .delete(validateParams(bilanTypeIdParam), BilanTypeController.remove);

