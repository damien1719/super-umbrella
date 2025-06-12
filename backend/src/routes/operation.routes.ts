import { Router } from 'express';
import { OperationController } from '../controllers/operation.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createOperationSchema,
  updateOperationSchema,
  operationIdParam,
} from '../schemas/operation.schema';

export const operationRouter = Router();

operationRouter
  .route('/')
  .post(validate(createOperationSchema), OperationController.create)
  .get(OperationController.list);

operationRouter
  .route('/:id')
  .get(validate(operationIdParam), OperationController.get)
  .patch(validate(updateOperationSchema), OperationController.update)
  .delete(validate(operationIdParam), OperationController.remove);
