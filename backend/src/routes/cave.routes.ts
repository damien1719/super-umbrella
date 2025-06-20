import { Router } from 'express';
import { CaveController } from '../controllers/cave.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createCaveSchema,
  updateCaveSchema,
  caveIdParam,
} from '../schemas/cave.schema';

export const caveRouter = Router();

caveRouter
  .route('/')
  .post(validateBody(createCaveSchema), CaveController.create)
  .get(CaveController.list);

caveRouter
  .route('/:id')
  .get(validateParams(caveIdParam), CaveController.get)
  .patch(
    validateParams(caveIdParam),
    validateBody(updateCaveSchema),
    CaveController.update,
  )
  .delete(validateParams(caveIdParam), CaveController.remove);
