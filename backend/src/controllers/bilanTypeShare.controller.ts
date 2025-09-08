import type { Request, Response, NextFunction } from 'express';
import { BilanTypeShareService } from '../services/bilanTypeShare.service';
import { isAdminUser } from '../utils/admin';
import { prisma } from '../prisma';

async function canManage(userId: string, bilanTypeId: string) {
  if (await isAdminUser(userId)) return true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const owner = await db.bilanType.findFirst({
    where: { id: bilanTypeId, author: { userId } },
    select: { id: true },
  });
  return !!owner;
}

export const BilanTypeShareController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(await canManage(req.user.id, req.params.bilanTypeId))) {
        res.status(403).send('Forbidden');
        return;
      }
      const { email, role } = req.body as { email: string; role?: 'VIEWER' | 'EDITOR' };
      const share = await BilanTypeShareService.create(req.user.id, req.params.bilanTypeId, email, role ?? 'EDITOR');
      res.status(201).json(share);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(await canManage(req.user.id, req.params.bilanTypeId))) {
        res.status(403).send('Forbidden');
        return;
      }
      const shares = await BilanTypeShareService.list(req.user.id, req.params.bilanTypeId);
      res.json(shares);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(await canManage(req.user.id, req.params.bilanTypeId))) {
        res.status(403).send('Forbidden');
        return;
      }
      await BilanTypeShareService.remove(req.user.id, req.params.bilanTypeId, req.params.shareId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
