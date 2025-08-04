import type { Request, Response, NextFunction } from 'express';
import {
  transformText,
  transformImageToTable,
} from '../services/ai/generate.service';
import { promptConfigs } from '../services/ai/prompts/promptconfig';

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
        tableau: table,
      };
      res.json({ result: [question] });
    } catch (e) {
      next(e);
    }
  },
};
