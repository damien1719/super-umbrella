import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  createPatientSchema,
  updatePatientSchema,
  patientIdParam,
} from '../schemas/patient.schema';

export const patientRouter = Router();

patientRouter
  .route('/')
  .post(validateBody(createPatientSchema), PatientController.create)
  .get(PatientController.list);

patientRouter
  .route('/:patientId')
  .get(validateParams(patientIdParam), PatientController.get)
  .put(
    validateParams(patientIdParam),
    validateBody(updatePatientSchema),
    PatientController.update,
  )
  .delete(validateParams(patientIdParam), PatientController.remove);
