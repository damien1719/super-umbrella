import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createProfileSchema,
  updateProfileSchema,
  profileIdParam,
} from '../schemas/profile.schema';

export const profileRouter = Router();

profileRouter
  .route('/')
  .post(validate(createProfileSchema), ProfileController.create)
  .get(ProfileController.list);

profileRouter
  .route('/:id')
  .get(validate(profileIdParam), ProfileController.get)
  .patch(validate(updateProfileSchema), ProfileController.update)
  .delete(validate(profileIdParam), ProfileController.remove);
