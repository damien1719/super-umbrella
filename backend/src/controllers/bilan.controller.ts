import type { Request, Response, NextFunction } from "express";
import { BilanService } from "../services/bilan.service";
import { sanitizeHtml } from "../utils/sanitize";
import { generateText } from "../services/ai/generate.service";
import { promptConfigs } from "../services/ai/prompts/promptconfig";
import { refineSelection } from "../services/ai/refineSelection.service";
import { concludeBilan } from "../services/ai/conclude.service";

export const BilanController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, ...data } = req.body
      const bilan = await BilanService.create(req.user.id, patientId, data)
      res.status(201).json(bilan)
    } catch (e) {
      next(e)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await BilanService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.get(req.user.id, req.params.bilanId);
      if (!bilan) {
        res.sendStatus(404);
        return;
      }
      res.json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.descriptionHtml) {
        req.body.descriptionHtml = sanitizeHtml(req.body.descriptionHtml);
      }
      const bilan = await BilanService.update(
        req.user.id,
        req.params.bilanId,
        req.body,
      );
      res.json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const section = req.body.section as keyof typeof promptConfigs;
      const answers = req.body.answers ?? {};
      const examples = Array.isArray(req.body.examples) ? req.body.examples : [];
      const cfg = promptConfigs[section];
      if (!cfg) {
        res.status(400).json({ error: 'invalid section' });
        return;
      }
      const text = await generateText({
        instructions: cfg.instructions,
        userContent: JSON.stringify(answers),
        examples,
      });
      res.json({ text });
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanService.remove(req.user.id, req.params.bilanId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },

  async refine(req: Request, res: Response, next: NextFunction) {
    try {
      const text = await refineSelection({
        refineInstruction: req.body.refineInstruction,
        selectedText: req.body.selectedText,
      });
      res.json({ text });
    } catch (e) {
      next(e);
    }
  },

  async conclude(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.get(req.user.id, req.params.bilanId);
      if (!bilan || !bilan.descriptionHtml) {
        res.status(404).json({ error: 'bilan not found' });
        return;
      }
      const text = await concludeBilan(bilan.descriptionHtml);
      res.json({ text });
    } catch (e) {
      next(e);
    }
  },
};
