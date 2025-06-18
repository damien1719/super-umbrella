import { Router } from 'express';
import { BienController } from '../controllers/bien.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createBienSchema,
  updateBienSchema,
  bienIdParam,
} from '../schemas/bien.schema';
import { profileIdParam } from '../schemas/profile.schema';

export const bienRouter = Router({ mergeParams: true });

bienRouter
  .route('/')
  .post(validate(createBienSchema), BienController.create)
  .get(BienController.list);

bienRouter
  .route('/:id')
  .get(validate(bienIdParam), BienController.get)
  .patch(validate(updateBienSchema), BienController.update)
  .delete(validate(bienIdParam), BienController.remove);
