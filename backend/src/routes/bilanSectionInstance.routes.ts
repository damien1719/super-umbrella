import { Router } from 'express';
import { BilanSectionInstanceController } from '../controllers/bilanSectionInstance.controller';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  createBilanSectionInstanceSchema,
  updateBilanSectionInstanceSchema,
  bilanSectionInstanceIdParam,
  bilanSectionInstanceListQuery,
} from '../schemas/bilanSectionInstance.schema';
import { generateFromTemplateSchema } from '../schemas/bilanSectionInstance.schema';

export const bilanSectionInstanceRouter = Router();

bilanSectionInstanceRouter
  .route('/')
  .post(
    validateBody(createBilanSectionInstanceSchema),
    BilanSectionInstanceController.create,
  )
  .get(
    validateQuery(bilanSectionInstanceListQuery),
    BilanSectionInstanceController.list,
  );

bilanSectionInstanceRouter
  .route('/:bilanSectionInstanceId')
  .get(
    validateParams(bilanSectionInstanceIdParam),
    BilanSectionInstanceController.get,
  )
  .put(
    validateParams(bilanSectionInstanceIdParam),
    validateBody(updateBilanSectionInstanceSchema),
    BilanSectionInstanceController.update,
  )
  .delete(
    validateParams(bilanSectionInstanceIdParam),
    BilanSectionInstanceController.remove,
  );

// Generation from template
bilanSectionInstanceRouter.post(
  '/generate-from-template',
  validateBody(generateFromTemplateSchema),
  BilanSectionInstanceController.generateFromTemplate,
);

