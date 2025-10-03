import { Router } from 'express';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { StylePresetController } from '../controllers/stylePreset.controller';
import { createStylePresetSchema, listStylePresetQuery } from '../schemas/stylePreset.schema';

export const stylePresetRouter = Router();

stylePresetRouter
  .route('/')
  .get(validateQuery(listStylePresetQuery), StylePresetController.list)
  .post(validateBody(createStylePresetSchema), StylePresetController.create);

