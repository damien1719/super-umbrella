import { Router } from 'express';
import { BilanTypeController } from '../controllers/bilanType.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createBilanTypeSchema,
  updateBilanTypeSchema,
  bilanTypeIdParam,
} from '../schemas/bilanType.schema';
import { BilanTypeShareController } from '../controllers/bilanTypeShare.controller';
import {
  createBilanTypeShareSchema,
  bilanTypeIdParam as shareBilanTypeIdParam,
  shareIdParam,
} from '../schemas/bilanTypeShare.schema';

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

// Shares sub-routes (owner only)
bilanTypeRouter
  .route('/:bilanTypeId/shares')
  .get(validateParams(shareBilanTypeIdParam), BilanTypeShareController.list)
  .post(
    validateParams(shareBilanTypeIdParam),
    validateBody(createBilanTypeShareSchema),
    BilanTypeShareController.create,
  );

bilanTypeRouter
  .route('/:bilanTypeId/shares/:shareId')
  .delete(
    validateParams(shareBilanTypeIdParam.merge(shareIdParam)),
    BilanTypeShareController.remove,
  );
