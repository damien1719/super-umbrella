import { Router } from 'express';
import { InventaireController } from '../controllers/inventaire.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createInventaireSchema,
  updateInventaireSchema,
  inventaireIdParam,
} from '../schemas/inventaire.schema';

export const inventaireRouter = Router();

inventaireRouter
  .route('/')
  .post(validateBody(createInventaireSchema), InventaireController.create)
  .get(InventaireController.list);

inventaireRouter
  .route('/:id')
  .get(validateParams(inventaireIdParam), InventaireController.get)
  .patch(
    validateParams(inventaireIdParam),
    validateBody(updateInventaireSchema),
    InventaireController.update,
  )
  .delete(validateParams(inventaireIdParam), InventaireController.remove);
