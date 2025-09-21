import type { Request, Response, NextFunction } from 'express';
import { BilanSectionInstanceService } from '../services/bilanSectionInstance.service';
import { generateFromTemplate as generateFromTemplateSvc } from '../services/ai/generateFromTemplate';
import { buildSectionPromptContext } from '../services/ai/promptContext';
import { prisma } from '../prisma';

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

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BilanSectionInstanceService.upsert(
        req.user.id,
        req.body,
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async generateFromTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { instanceId, trameId, answers, stylePrompt, rawNotes, contentNotes, userSlots, imageBase64 } = req.body as {
        instanceId: string; trameId: string; answers: string[]; stylePrompt?: string; rawNotes?: string; contentNotes?: Record<string, unknown>; userSlots?: Record<string, unknown>; imageBase64?: string;
      };
      if (!instanceId || !trameId) {
        res.status(400).json({ error: 'instanceId and trameId are required' });
        return;
      }
      // Resolve Section.templateRef.id from trameId (Section.id)
      const section = await (prisma as any).section.findUnique({ where: { id: trameId }, include: { templateRef: true } });
      const sectionTemplateId = section?.templateRefId || section?.templateRef?.id;
      if (!sectionTemplateId) {
        res.status(400).json({ error: 'Section has no associated templateRef' });
        return;
      }
      const instance = await (prisma as any).bilanSectionInstance.findUnique({ where: { id: instanceId }, select: { bilanId: true } });
      if (!instance) {
        res.status(404).json({ error: 'Bilan section instance not found' });
        return;
      }
      console.log('sectionTemplateId', sectionTemplateId);
      console.log('answers', answers);
      console.log('rawNotes', rawNotes);
      console.log('BilanSectionInstance - contentNotes', contentNotes);
      console.log('userSlots', userSlots);
      console.log('imageBase64', imageBase64 ? '[PRESENT]' : '[ABSENT]');
      console.log('stylePrompt', stylePrompt);

      // Recompose notes context from chunks + raw notes + optional structured answers (contentNotes)
      const aggregatedNotes: Record<string, unknown> = {
        ...(contentNotes || {}),
        _chunks: answers,
        _rawNotes: rawNotes,
      };

      const promptContext = await buildSectionPromptContext({
        userId: req.user.id,
        bilanId: instance.bilanId,
        baseContent: JSON.stringify(aggregatedNotes ?? {}),
        sectionId: trameId,
        fallbackSectionTitle: section?.title,
      });

      const result = await generateFromTemplateSvc(sectionTemplateId, aggregatedNotes, { instanceId, userSlots, stylePrompt, imageBase64, contextMd: promptContext.content });
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
