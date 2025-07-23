import { Router } from 'express';
import { SectionExampleController } from '../controllers/sectionExample.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createSectionExampleSchema,
  updateSectionExampleSchema,
  sectionExampleIdParam,
} from '../schemas/sectionExample.schema';

export const sectionExampleRouter = Router();

sectionExampleRouter
  .route('/')
  .post(validateBody(createSectionExampleSchema), SectionExampleController.create)
  .get(SectionExampleController.list);

sectionExampleRouter
  .route('/:sectionExampleId')
  .get(validateParams(sectionExampleIdParam), SectionExampleController.get)
  .put(
    validateParams(sectionExampleIdParam),
    validateBody(updateSectionExampleSchema),
    SectionExampleController.update,
  )
  .delete(
    validateParams(sectionExampleIdParam),
    SectionExampleController.remove,
  );
