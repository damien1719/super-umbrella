import { Router } from 'express';
import { OperationController } from '../controllers/operation.controller';
import {
  validateBody,
  validateParams,
} from '../middlewares/validate.middleware';
import {
  createOperationSchema,
  updateOperationSchema,
  operationIdParam,
} from '../schemas/operation.schema';

export const operationRouter = Router();

operationRouter
  .route('/')
  .post(validateBody(createOperationSchema), OperationController.create)
  .get(OperationController.list);

operationRouter
  .route('/:id')
  .get(validateParams(operationIdParam), OperationController.get)
  .patch(
    validateParams(operationIdParam),
    validateBody(updateOperationSchema),
    OperationController.update,
  )
  .delete(validateParams(operationIdParam), OperationController.remove);
