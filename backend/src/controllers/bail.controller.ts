import type { Request, Response, NextFunction } from 'express';
import { BailService } from '../services/bail.service';

export const BailController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const bailleurNom = req.query.bailleurNom as string;
      const bailleurPrenom = req.query.bailleurPrenom as string;
      const doc = await BailService.generate({ bailleurNom, bailleurPrenom });
      res
        .status(200)
        .set({
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="bail.docx"',
        })
        .send(doc);
    } catch (e) {
      next(e);
    }
  },
};
