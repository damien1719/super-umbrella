import { Router } from 'express';
import { BienController } from '../controllers/bien.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createBienSchema,
  updateBienSchema,
  bienIdParam,
} from '../schemas/bien.schema';
import { profileIdParam } from '../schemas/profile.schema';

export const bienRouter = Router({ mergeParams: true });

bienRouter
  .route('/')
  .post(validateBody(createBienSchema), BienController.create)
  .get(BienController.list);

bienRouter
  .route('/:id')
  .get(validateParams(bienIdParam), BienController.get)
  .patch(validateBody(updateBienSchema), BienController.update)
  .delete(validateParams(bienIdParam), BienController.remove);
