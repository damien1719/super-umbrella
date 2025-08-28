import { Router } from 'express';
import { BilanController } from '../controllers/bilan.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createBilanSchema,
  updateBilanSchema,
  bilanIdParam,
} from '../schemas/bilan.schema';
import { generateBilanTypeBody } from '../schemas/generateBilanType.schema';

export const bilanRouter = Router();

bilanRouter
  .route('/')
  .post(validateBody(createBilanSchema), BilanController.create)
  .get(BilanController.list);

bilanRouter
  .route('/:bilanId')
  .get(validateParams(bilanIdParam), BilanController.get)
  .put(
    validateParams(bilanIdParam),
    validateBody(updateBilanSchema),
    BilanController.update,
  )
  .delete(validateParams(bilanIdParam), BilanController.remove);

bilanRouter.post(
  '/:bilanId/generate',
  validateParams(bilanIdParam),
  BilanController.generate,
);

bilanRouter.post(
  '/:bilanId/refine',
  validateParams(bilanIdParam),
  BilanController.refine,
);

bilanRouter.post(
  '/:bilanId/conclude',
  validateParams(bilanIdParam),
  BilanController.conclude,
);

// Generate a full BilanType (all sections) and return assembled Lexical state
bilanRouter.post(
  '/:bilanId/generate-bilan-type',
  validateParams(bilanIdParam),
  validateBody(generateBilanTypeBody),
  BilanController.generateBilanType,
);

