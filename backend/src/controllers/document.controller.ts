import type { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { createClient } from '@supabase/supabase-js';

export const DocumentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const fileReq = req as Request & { file?: { originalname: string; buffer: Buffer; mimetype: string } };
      let fileUrl = req.body.fileUrl as string | undefined;
      let fileName = req.body.fileName as string | undefined;

      if (fileReq.file) {
        const supabase = createClient(
          process.env.SUPABASE_URL ?? 'http://localhost',
          process.env.SUPABASE_KEY ?? 'key',
        );
        const path = `${Date.now()}_${fileReq.file.originalname}`;
        const { error } = await supabase.storage
          .from('documents')
          .upload(path, fileReq.file.buffer, {
            contentType: fileReq.file.mimetype,
          });
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabase.storage.from('documents').getPublicUrl(path);
        fileUrl = publicUrl;
        fileName = fileReq.file.originalname;
      }

      const doc = await DocumentService.create({
        ...req.body,
        fileUrl,
        fileName,
      });
      res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const bienId = req.query.bienId as string | undefined;
      res.json(await DocumentService.list(bienId));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await DocumentService.get(req.params.id);
      if (!doc) {
        res.sendStatus(404);
        return;
      }
      res.json(doc);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await DocumentService.update(req.params.id, req.body);
      res.json(doc);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await DocumentService.remove(req.params.id);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
