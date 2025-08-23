import { Router } from 'express';
import { SectionTemplateController } from '../controllers/sectionTemplate.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createSectionTemplateSchema,
  updateSectionTemplateSchema,
  sectionTemplateIdParam,
} from '../schemas/sectionTemplate.schema';

export const sectionTemplateRouter = Router();

sectionTemplateRouter
  .route('/')
  .post(validateBody(createSectionTemplateSchema), SectionTemplateController.create)
  .get(SectionTemplateController.list);

sectionTemplateRouter
  .route('/:sectionTemplateId')
  .get(validateParams(sectionTemplateIdParam), SectionTemplateController.get)
  .put(
    validateBody(updateSectionTemplateSchema),
    SectionTemplateController.update,
  )
  .delete(
    validateParams(sectionTemplateIdParam),
    SectionTemplateController.remove,
  );
