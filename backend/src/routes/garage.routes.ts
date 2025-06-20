import { Router } from 'express';
import { GarageController } from '../controllers/garage.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createGarageSchema,
  updateGarageSchema,
  garageIdParam,
} from '../schemas/garage.schema';

export const garageRouter = Router();

garageRouter
  .route('/')
  .post(validateBody(createGarageSchema), GarageController.create)
  .get(GarageController.list);

garageRouter
  .route('/:id')
  .get(validateParams(garageIdParam), GarageController.get)
  .patch(
    validateParams(garageIdParam),
    validateBody(updateGarageSchema),
    GarageController.update,
  )
  .delete(validateParams(garageIdParam), GarageController.remove);
