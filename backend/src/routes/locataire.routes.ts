import { Router } from 'express';
import { LocataireController } from '../controllers/locataire.controller';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middlewares/validate.middleware';
import {
  createLocataireSchema,
  updateLocataireSchema,
  locataireIdParam,
  locataireFilterQuery,
} from '../schemas/locataire.schema';
import { bienIdParam } from '../schemas/bien.schema';

export const locataireRouter = Router();

locataireRouter
  .route('/')
  .post(validateBody(createLocataireSchema), LocataireController.create)
  .get(
    validateQuery(locataireFilterQuery),
    LocataireController.list,
  );

locataireRouter
  .route('/:locataireId')
  .get(validateParams(locataireIdParam), LocataireController.get)
  .patch(
    validateParams(locataireIdParam),
    validateBody(updateLocataireSchema),
    LocataireController.update,
  )
  .delete(validateParams(locataireIdParam), LocataireController.remove);

locataireRouter.get(
  '/properties/:id/locataires',
  validateParams(bienIdParam),
  LocataireController.listForProperty,
);
