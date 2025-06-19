import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import {
  validateBody,
  validateParams,
} from '../middlewares/validate.middleware';
import {
  createActivitySchema,
  updateActivitySchema,
  activityIdParam,
} from '../schemas/activity.schema';

export const activityRouter = Router();

activityRouter
  .route('/')
  .post(validateBody(createActivitySchema), ActivityController.create)
  .get(ActivityController.list);

activityRouter
  .route('/:id')
  .get(validateParams(activityIdParam), ActivityController.get)
  .patch(
    validateParams(activityIdParam),
    validateBody(updateActivitySchema),
    ActivityController.update,
  )
  .delete(validateParams(activityIdParam), ActivityController.remove);
