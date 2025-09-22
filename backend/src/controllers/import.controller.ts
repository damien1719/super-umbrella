import type { Request, Response, NextFunction } from 'express';
import {
  transformText,
  transformImageToTable,
  transformTextToTable,
  transformExcelToTable,
} from '../services/ai/generate.service';
import { promptConfigs } from '../services/ai/prompts/promptconfig';
import { importMagiqueToTemplate } from '../services/ai/prompts/importMagiqueToTemplate';
import { SectionTemplateService } from '../services/sectionTemplate.service';
import { SectionService } from '../services/section.service';
import { prisma } from '../prisma';

export const ImportController = {
  async transform(req: Request, res: Response, next: NextFunction) {
    try {
      const content = String(req.body.content || '');
      const result = await transformText({
        instructions: promptConfigs.transformationImport.instructions,
        userContent: content,
        outputSchema: JSON.stringify({}) // utilise le schéma par défaut défini dans transformPrompt
      });
      res.json({ result });
    } catch (e) {
      next(e);
    }
  },
  async transformImage(req: Request, res: Response, next: NextFunction) {
    try {
      const image = String(req.body.image || '');
      const table = await transformImageToTable({ imageBase64: image });
      const question = {
        id: Date.now().toString(),
        type: 'tableau' as const,
        titre: 'Question sans titre',
        tableau: {
          columns: table.columns,
          rowsGroups: table.rowsGroups,
        },
      };
      res.json({ result: [question] });
    } catch (e) {
      next(e);
    }
  },
  async transformTextToTable(req: Request, res: Response, next: NextFunction) {
    try {
      const content = String(req.body.content || '');
      const table = await transformTextToTable({ content });
      const question = {
        id: Date.now().toString(),
        type: 'tableau' as const,
        titre: '',
        tableau: {
          columns: table.columns,
          rowsGroups: table.rowsGroups,
        },
      };
      res.json({ result: [question] });
    } catch (e) {
      next(e);
    }
  },
  async transformExcelToTable(req: Request, res: Response, next: NextFunction) {
    try {
      const sheetName = String(req.body.sheetName || 'Feuille1');
      const html = String(req.body.html || '');
      const table = await transformExcelToTable({ sheetName, html });
      const question = {
        id: Date.now().toString(),
        type: 'tableau' as const,
        titre: sheetName,
        tableau: {
          columns: table.columns,
          rowsGroups: table.rowsGroups,
        },
      };
      res.json({ result: [question] });
    } catch (e) {
      next(e);
    }
  },
  async importMagiqueToTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('[DEBUG] importMagiqueToTemplate - Starting');
      const sectionId = String(req.body.sectionId || '');
      const sourceText = String(req.body.sourceText || '');
      console.log('[DEBUG] importMagiqueToTemplate - sectionId:', sectionId);
      console.log('[DEBUG] importMagiqueToTemplate - sourceText length:', sourceText.length);

      if (!sectionId || !sourceText) {
        console.error('[DEBUG] importMagiqueToTemplate - Missing required fields');
        res.status(400).json({ error: 'Missing sectionId or sourceText' });
        return;
      }

      // 1) Ask LLM to extract template structure (slots + AST skeleton)
      console.log('[DEBUG] importMagiqueToTemplate - Calling LLM service...');
      const { content, slotsSpec, label } = await importMagiqueToTemplate({ sourceText });
      console.log('[DEBUG] importMagiqueToTemplate - LLM result - content:', !!content);
      console.log('[DEBUG] importMagiqueToTemplate - LLM result - slots count:', slotsSpec.length);
      console.log('[DEBUG] importMagiqueToTemplate - LLM result - label:', label);
      console.log('[DEBUG] importMagiqueToTemplate - LLM result - slots:', JSON.stringify(slotsSpec, null, 2));

      // 2) Persist as SectionTemplate (create or override if section already has one)
      console.log('[DEBUG] importMagiqueToTemplate - Creating or overriding template in DB...');
      let saved;
      try {
        const section = await (prisma as any).section.findUnique({ where: { id: sectionId }, select: { templateRefId: true, title: true } });
        if (section?.templateRefId) {
          console.log('[DEBUG] importMagiqueToTemplate - Section already has template, overriding:', section.templateRefId);
          console.log('[DEBUG] importMagiqueToTemplate - Saving to DB - slotsSpec:', JSON.stringify(slotsSpec, null, 2));
          const updated = await SectionTemplateService.update(section.templateRefId, {
            label: label || section.title || 'Template généré',
            content: content,
            slotsSpec: slotsSpec,
          });
          saved = updated.template as { id: string };
        } else {
          const templateId = `${Date.now()}`;
          console.log('[DEBUG] importMagiqueToTemplate - Creating new template - slotsSpec:', JSON.stringify(slotsSpec, null, 2));
          saved = await SectionTemplateService.create({
            id: templateId,
            label: label || 'Template généré',
            content: content,
            slotsSpec: slotsSpec,
          });
          // Link template to section
          await (SectionService as any).update?.(undefined, sectionId, { templateRefId: saved.id });
        }
      } catch (persistErr) {
        console.error('[DEBUG] importMagiqueToTemplate - Persist error:', persistErr);
        throw persistErr;
      }
      console.log('[DEBUG] importMagiqueToTemplate - Template saved with id:', saved.id);

      // 3) Link template to section (set section.templateRefId)
      try {
        console.log('[DEBUG] importMagiqueToTemplate - Linking template to section...');
        // userId isn't available in this controller; backend expects auth. We update without user filter using prisma client directly through service where possible.
        // If SectionService requires userId, you might adjust it. Here we fallback to raw prisma access via any cast:
        await (SectionService as any).update?.(undefined, sectionId, { templateRefId: saved.id });
      } catch (linkErr) {
        console.warn('[DEBUG] importMagiqueToTemplate - Could not link template to section via SectionService. Ensure user context in middleware.', linkErr);
      }

      res.json({ template: saved });
    } catch (e) {
      console.error('[DEBUG] importMagiqueToTemplate - Error:', e);
      next(e);
    }
  },
};
