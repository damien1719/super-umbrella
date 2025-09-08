import { Router } from 'express';
import { BilanTypeShareController } from '../controllers/bilanTypeShare.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { createShareSchema, shareIdParam } from '../schemas/share.schema';
import { bilanTypeIdParam } from '../schemas/bilanType.schema';

export const bilanTypeShareRouter = Router();

bilanTypeShareRouter
  .route('/:bilanTypeId/shares')
  .post(
    validateParams(bilanTypeIdParam),
    validateBody(createShareSchema),
    BilanTypeShareController.create,
  )
  .get(
    validateParams(bilanTypeIdParam),
    BilanTypeShareController.list,
  );

bilanTypeShareRouter
  .route('/:bilanTypeId/shares/:shareId')
  .delete(
    validateParams(bilanTypeIdParam.merge(shareIdParam)),
    BilanTypeShareController.remove,
  );

