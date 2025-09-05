import { Router } from 'express';
import { SectionShareController } from '../controllers/sectionShare.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { createShareSchema, shareIdParam } from '../schemas/share.schema';
import { sectionIdParam } from '../schemas/section.schema';

export const sectionShareRouter = Router();

sectionShareRouter
  .route('/:sectionId/shares')
  .post(
    validateParams(sectionIdParam),
    validateBody(createShareSchema),
    SectionShareController.create,
  )
  .get(
    validateParams(sectionIdParam),
    SectionShareController.list,
  );

sectionShareRouter
  .route('/:sectionId/shares/:shareId')
  .delete(
    validateParams(sectionIdParam.merge(shareIdParam)),
    SectionShareController.remove,
  );

