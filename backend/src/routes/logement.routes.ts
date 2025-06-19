import { Router } from 'express';
import { LogementController } from '../controllers/logement.controller';
import {
  validateBody,
  validateParams,
} from '../middlewares/validate.middleware';
import {
  createLogementSchema,
  updateLogementSchema,
  logementIdParam,
} from '../schemas/logement.schema';

export const logementRouter = Router();

logementRouter
  .route('/')
  .post(validateBody(createLogementSchema), LogementController.create)
  .get(LogementController.list);

logementRouter
  .route('/:id')
  .get(validateParams(logementIdParam), LogementController.get)
  .patch(
    validateParams(logementIdParam),
    validateBody(updateLogementSchema),
    LogementController.update,
  )
  .delete(validateParams(logementIdParam), LogementController.remove);
