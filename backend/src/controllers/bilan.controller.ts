import type { Request, Response, NextFunction } from "express";
import { BilanService } from "../services/bilan.service";
import { ProfileService } from "../services/profile.service";
import { sanitizeHtml } from "../utils/sanitize";
import { generateText } from "../services/ai/generate.service";
import { Anonymization } from "../services/ai/anonymize.service";
import { promptConfigs } from "../services/ai/prompts/promptconfig";
import { refineSelection } from "../services/ai/refineSelection.service";
import { concludeBilan } from "../services/ai/conclude.service";
import { commentTestResults as commentTestResultsService } from "../services/ai/commentTestResults.service";

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
      const rawNotes = typeof req.body.rawNotes === 'string' ? req.body.rawNotes : undefined;
      const stylePrompt = typeof req.body.stylePrompt === 'string' ? req.body.stylePrompt : undefined;
      const examples = Array.isArray(req.body.examples) ? req.body.examples : [];
      const cfg = promptConfigs[section];
      if (!cfg) {
        res.status(400).json({ error: 'invalid section' });
        return;
      }
      // Récupère le job du profil actif (si disponible)
      const profiles = (await ProfileService.list(req.user.id)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;

      // Anonymisation en entrée (remplace le nom du patient par un placeholder générique)
      // Récupère nom/prénom si disponibles
      const patient = await BilanService.get(req.user.id, req.params.bilanId);
      let userContent = JSON.stringify(answers);
      if (patient && typeof patient === 'object') {
        const p = patient as {
          firstName?: string;
          lastName?: string;
          patient?: { firstName?: string; lastName?: string };
        };
        const firstName = p.firstName || p.patient?.firstName;
        const lastName = p.lastName || p.patient?.lastName;
        if (firstName || lastName) {
          userContent = Anonymization.anonymizeText(userContent, { firstName, lastName });
        }
      }

      const text = await generateText({
        instructions: cfg.instructions,
        userContent,
        examples,
        stylePrompt,
        rawNotes,
        job,
      });
      // Post-traitement: réinjecte le nom du patient si connu, sinon renvoie tel quel
      let postText = text as string;
      if (patient && typeof patient === 'object') {
        const p = patient as {
          firstName?: string;
          lastName?: string;
          patient?: { firstName?: string; lastName?: string };
        };
        const firstName = p.firstName || p.patient?.firstName;
        const lastName = p.lastName || p.patient?.lastName;
        if (firstName || lastName) {
          postText = Anonymization.deanonymizeText(postText, { firstName, lastName });
        }
      }
      res.json({ text: postText });
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
      // Récupère aussi le job pour le raffinage
      const profiles = (await ProfileService.list(req.user.id)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;
      const text = await refineSelection({
        refineInstruction: req.body.refineInstruction,
        selectedText: req.body.selectedText,
        job,
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

  async commentTestResults(req: Request, res: Response, next: NextFunction) {
    try {
      const html = req.body.html;
      if (typeof html !== 'string') {
        res.status(400).json({ error: 'html required' });
        return;
      }
      const text = await commentTestResultsService(html);
      res.json({ text });
    } catch (e) {
      next(e);
    }
  },
};
