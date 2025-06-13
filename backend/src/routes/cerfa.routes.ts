import { Router } from 'express';
import { CerfaController } from '../controllers/cerfa.controller';
import { validate } from '../middlewares/validate.middleware';
import { cerfa2031QuerySchema, cerfa2033QuerySchema } from '../schemas/cerfa.schema';

export const cerfaRouter = Router();

cerfaRouter.get('/2031-sd', validate(cerfa2031QuerySchema), CerfaController.generate2031);
cerfaRouter.get('/2033', validate(cerfa2033QuerySchema), CerfaController.generate2033);
