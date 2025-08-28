import { Router } from 'express';
import { BilanTypeSectionController } from '../controllers/bilanTypeSection.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createBilanTypeSectionSchema,
  updateBilanTypeSectionSchema,
  bilanTypeSectionIdParam,
} from '../schemas/bilanTypeSection.schema';

export const bilanTypeSectionRouter = Router();

bilanTypeSectionRouter
  .route('/')
  .post(
    validateBody(createBilanTypeSectionSchema),
    BilanTypeSectionController.create,
  )
  .get(BilanTypeSectionController.list);

bilanTypeSectionRouter
  .route('/:bilanTypeSectionId')
  .get(
    validateParams(bilanTypeSectionIdParam),
    BilanTypeSectionController.get,
  )
  .patch(
    validateParams(bilanTypeSectionIdParam),
    validateBody(updateBilanTypeSectionSchema),
    BilanTypeSectionController.update,
  )
  .delete(
    validateParams(bilanTypeSectionIdParam),
    BilanTypeSectionController.remove,
  );
