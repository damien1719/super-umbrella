import type { Request, Response, NextFunction } from 'express';
import { BilanSectionInstanceService } from '../services/bilanSectionInstance.service';
import { generateFromTemplate as generateFromTemplateSvc } from '../services/ai/prompts/generateFromTemplate.service';

export const BilanSectionInstanceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const instance = await BilanSectionInstanceService.create(req.user.id, req.body);
      res.status(201).json(instance);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { bilanId, sectionId, latest } = req.query as {
        bilanId: string;
        sectionId?: string;
        latest?: string;
      };
      const instances = await BilanSectionInstanceService.list(
        req.user.id,
        bilanId,
        sectionId,
        latest === 'true',
      );
      res.json(instances);
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const instance = await BilanSectionInstanceService.get(
        req.user.id,
        req.params.bilanSectionInstanceId,
      );
      if (!instance) {
        res.sendStatus(404);
        return;
      }
      res.json(instance);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const instance = await BilanSectionInstanceService.update(
        req.user.id,
        req.params.bilanSectionInstanceId,
        req.body,
      );
      res.json(instance);
    } catch (e) {
      next(e);
    }
  },

  async generateFromTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { instanceId, sectionTemplateId, contentNotes, userSlots, stylePrompt } = req.body as {
        instanceId: string; sectionTemplateId: string; contentNotes: Record<string, unknown>; userSlots?: Record<string, unknown>; stylePrompt?: string;
      };
      if (!instanceId || !sectionTemplateId) {
        res.status(400).json({ error: 'instanceId and sectionTemplateId are required' });
        return;
      }
      const result = await generateFromTemplateSvc(sectionTemplateId, contentNotes || {}, { instanceId, userSlots, stylePrompt });
      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanSectionInstanceService.remove(
        req.user.id,
        req.params.bilanSectionInstanceId,
      );
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};

