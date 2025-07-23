import { Router, Request, Response } from 'express';

const router = Router();

interface Section {
  id: number;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

// Simple in-memory data to mimic DB
const SECTIONS: Record<string, Section[]> = {
  '1': [
    { id: 1, title: 'Intro', content: 'Contenu intro', metadata: { level: 1 } },
    { id: 2, title: 'Conclusion', content: 'Fin', metadata: { level: 1 } },
  ],
};

router.get('/:bilanId/sections', (req: Request, res: Response) => {
  const { bilanId } = req.params;
  const sections = SECTIONS[bilanId] ?? [];
  res.json({ sections });
});

export default router;
