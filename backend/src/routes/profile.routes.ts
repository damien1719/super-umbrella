import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import {
  validateBody,
  validateParams,
} from '../middlewares/validate.middleware';
import {
  createProfileSchema,
  updateProfileSchema,
  profileIdParam,
} from '../schemas/profile.schema';

export const profileRouter = Router();

profileRouter
  .route('/')
  .post(validateBody(createProfileSchema), ProfileController.create)
  .get(ProfileController.list);

profileRouter
  .route('/:profileId')
  .get(validateParams(profileIdParam), ProfileController.get)
  .patch(
    validateParams(profileIdParam),
    validateBody(updateProfileSchema),
    ProfileController.update,
  )
  .delete(validateParams(profileIdParam), ProfileController.remove);
