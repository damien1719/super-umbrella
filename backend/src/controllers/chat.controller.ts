import type { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';

export const ChatController = {
  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const bilanId = req.params.bilanId;
      if (!bilanId) {
        res.status(400).json({ error: 'bilanId is required' });
        return;
      }
      const ok = await ChatService.ensureOwnership(req.user.id, bilanId);
      if (!ok) {
        res.status(403).json({ error: 'forbidden' });
        return;
      }
      const messages = await ChatService.listMessages(req.user.id, bilanId);
      res.json({ messages });
    } catch (e) {
      next(e);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const bilanId = typeof req.body?.bilanId === 'string' ? req.body.bilanId : '';
      const content = typeof req.body?.content === 'string' ? req.body.content : '';
      const mode = typeof req.body?.mode === 'string' ? req.body.mode : '';
      const selectedText = typeof req.body?.selectedText === 'string' ? req.body.selectedText : '';
      if (!bilanId || !content) {
        res.status(400).json({ error: 'bilanId and content are required' });
        return;
      }
      const owns = await ChatService.ensureOwnership(req.user.id, bilanId);
      if (!owns) {
        res.status(403).json({ error: 'forbidden' });
        return;
      }
      const result =
        mode === 'refine' && selectedText
          ? await ChatService.sendRefineMessage(req.user.id, bilanId, {
              selectedText,
              refineInstruction: content,
            })
          : await ChatService.sendMessage(req.user.id, bilanId, content);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },
};
