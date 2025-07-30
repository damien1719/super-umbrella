import type { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service';

export const PatientController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.create(req.user.id, req.body);
      res.status(201).json(patient);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await PatientService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.get(req.user.id, req.params.patientId);
      if (!patient) {
        res.sendStatus(404);
        return;
      }
      res.json(patient);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await PatientService.update(
        req.user.id,
        req.params.patientId,
        req.body,
      );
      res.json(patient);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await PatientService.remove(req.user.id, req.params.patientId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
