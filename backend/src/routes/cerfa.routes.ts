import { Router } from 'express';
import { CerfaController } from '../controllers/cerfa.controller';
import { validate } from '../middlewares/validate.middleware';
import { cerfa2031QuerySchema } from '../schemas/cerfa.schema';

export const cerfaRouter = Router();

cerfaRouter.get('/2031-sd', validate(cerfa2031QuerySchema), CerfaController.generate2031);
