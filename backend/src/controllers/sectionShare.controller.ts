import type { Request, Response, NextFunction } from 'express';
import { SectionShareService } from '../services/sectionShare.service';
import { isAdminUser } from '../utils/admin';
import { prisma } from '../prisma';

async function canManage(userId: string, sectionId: string) {
  if (await isAdminUser(userId)) return true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const owner = await db.section.findFirst({
    where: { id: sectionId, author: { userId } },
    select: { id: true },
  });
  return !!owner;
}

export const SectionShareController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(await canManage(req.user.id, req.params.sectionId))) {
        res.status(403).send('Forbidden');
        return;
      }
      const { email, role } = req.body as { email: string; role?: 'VIEWER' | 'EDITOR' };
      const share = await SectionShareService.create(req.user.id, req.params.sectionId, email, role ?? 'EDITOR');
      res.status(201).json(share);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(await canManage(req.user.id, req.params.sectionId))) {
        res.status(403).send('Forbidden');
        return;
      }
      const shares = await SectionShareService.list(req.user.id, req.params.sectionId);
      res.json(shares);
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!(await canManage(req.user.id, req.params.sectionId))) {
        res.status(403).send('Forbidden');
        return;
      }
      await SectionShareService.remove(req.user.id, req.params.sectionId, req.params.shareId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },
};
