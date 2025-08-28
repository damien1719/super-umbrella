import { BilanTypeSectionService } from '../services/bilanTypeSection.service';
import { Request, Response } from 'express';

export const BilanTypeSectionController = {
  async create(req: Request, res: Response) {
    const item = await BilanTypeSectionService.create(req.user.id, req.body);
    res.status(201).json(item);
  },

  async list(req: Request, res: Response) {
    res.json(await BilanTypeSectionService.list(req.user.id));
  },

  async get(req: Request, res: Response) {
    const item = await BilanTypeSectionService.get(
      req.user.id,
      req.params.bilanTypeSectionId,
    );
    res.json(item);
  },

  async update(req: Request, res: Response) {
    const item = await BilanTypeSectionService.update(
      req.user.id,
      req.params.bilanTypeSectionId,
      req.body,
    );
    res.json(item);
  },

  async remove(req: Request, res: Response) {
    await BilanTypeSectionService.remove(
      req.user.id,
      req.params.bilanTypeSectionId,
    );
    res.status(204).send();
  },
};
