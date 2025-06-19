import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdParam,
} from '../schemas/document.schema';

export const documentRouter = Router();

documentRouter
  .route('/')
  .post(upload.single('file'), validateBody(createDocumentSchema.partial()), DocumentController.create)
  .get(DocumentController.list);

documentRouter
  .route('/:id')
  .get(validateParams(documentIdParam), DocumentController.get)
  .patch(
    validateParams(documentIdParam),
    validateBody(updateDocumentSchema),
    DocumentController.update,
  )
  .delete(validateParams(documentIdParam), DocumentController.remove);
