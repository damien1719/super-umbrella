import { Router } from 'express';
import { BailController } from '../controllers/bail.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { bailQuerySchema } from '../schemas/bail.schema';

export const bailRouter = Router();

bailRouter.get('/location-meublee', validateQuery(bailQuerySchema), BailController.generate);
