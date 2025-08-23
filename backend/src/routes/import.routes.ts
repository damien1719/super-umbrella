import { Router } from 'express';
import { ImportController } from '../controllers/import.controller';

export const importRouter = Router();

importRouter.post('/transform', ImportController.transform);
importRouter.post('/transform-image', ImportController.transformImage);
importRouter.post('/transform-text-table', ImportController.transformTextToTable);
importRouter.post('/transform-excel-table', ImportController.transformExcelToTable);
importRouter.post('/importMagiqueToTemplate', ImportController.importMagiqueToTemplate);
