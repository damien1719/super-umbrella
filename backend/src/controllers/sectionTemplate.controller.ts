import type { Request, Response, NextFunction } from 'express';
import { SectionTemplateService } from '../services/sectionTemplate.service';

export const SectionTemplateController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await SectionTemplateService.create(req.body);
      res.status(201).json(template);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await SectionTemplateService.list());
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await SectionTemplateService.get(
        req.params.sectionTemplateId,
      );
      if (!template) {
        res.sendStatus(404);
        return;
      }
      res.json(template);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SectionTemplateService.update(
        req.params.sectionTemplateId,
        req.body,
      );
      res.json({
        template: result.template,
        schema: result.schema,
        content: (result.template as { content?: unknown })?.content,
        genPartsSpec: result.genPartsSpec,
        report: result.report,
      });
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await SectionTemplateService.remove(req.params.sectionTemplateId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
