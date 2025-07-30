import { Router } from 'express';
import { SectionController } from '../controllers/section.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createSectionSchema,
  updateSectionSchema,
  sectionIdParam,
} from '../schemas/section.schema';

export const sectionRouter = Router();

sectionRouter
  .route('/')
  .post(validateBody(createSectionSchema), SectionController.create)
  .get(SectionController.list);

sectionRouter
  .route('/:sectionId')
  .get(validateParams(sectionIdParam), SectionController.get)
  .put(
    validateParams(sectionIdParam),
    validateBody(updateSectionSchema),
    SectionController.update,
  )
  .delete(validateParams(sectionIdParam), SectionController.remove);
