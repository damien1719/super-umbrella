import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createActivitySchema,
  updateActivitySchema,
  activityIdParam,
} from '../schemas/activity.schema';

export const activityRouter = Router();

activityRouter
  .route('/')
  .post(validate(createActivitySchema), ActivityController.create)
  .get(ActivityController.list);

activityRouter
  .route('/:id')
  .get(validate(activityIdParam), ActivityController.get)
  .patch(validate(updateActivitySchema), ActivityController.update)
  .delete(validate(activityIdParam), ActivityController.remove);
