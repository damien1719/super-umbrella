import type { Request, Response, NextFunction } from 'express';
import { generateText } from '../services/ai/generate.service';

export const ImportController = {
  async transform(req: Request, res: Response, next: NextFunction) {
    try {
      const content = String(req.body.content || '');
      const text = (await generateText({
        instructions: 'transforme en liste de questions',
        userContent: content,
      })) as string;
      let result: unknown;
      try {
        result = JSON.parse(text);
      } catch {
        result = text;
      }
      res.json({ result });
    } catch (e) {
      next(e);
    }
  },
};
