import { Router } from 'express';
import { LogementController } from '../controllers/logement.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createLogementSchema,
  updateLogementSchema,
  logementIdParam,
} from '../schemas/logement.schema';

export const logementRouter = Router();

logementRouter
  .route('/')
  .post(validate(createLogementSchema), LogementController.create)
  .get(LogementController.list);

logementRouter
  .route('/:id')
  .get(validate(logementIdParam), LogementController.get)
  .patch(validate(updateLogementSchema), LogementController.update)
  .delete(validate(logementIdParam), LogementController.remove);
