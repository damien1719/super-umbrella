import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SectionExampleData = {
  sectionId: string;
  label?: string | null;
  content: string;
  stylePrompt?: string;
};

export const SectionExampleService = {
  async create(userId: string, data: SectionExampleData) {
    const section = await db.section.findFirst({
      where: { id: data.sectionId, author: { userId } },
    });
    if (!section) throw new NotFoundError('Section not found for user');
    let stylePrompt = data.stylePrompt;
    if (!stylePrompt && data.content) {
      try {
        const { extractStyle } = await import('./ai/prompts/extractStylePrompt');
        stylePrompt = await extractStyle({ texts: [data.content] });
      } catch {}
    }
    return db.sectionExample.create({ data: { ...data, stylePrompt } });
  },

  list(userId: string) {
    return db.sectionExample.findMany({
      where: {
        section: {
          OR: [
            { isPublic: true },
            { author: { userId } },
          ],
        },
      },
      orderBy: { label: 'asc' },
    });
  },

  get(userId: string, id: string) {
    return db.sectionExample.findFirst({
      where: {
        id,
        section: {
          OR: [
            { isPublic: true },
            { author: { userId } },
          ],
        },
      },
    });
  },

  async update(userId: string, id: string, data: Partial<SectionExampleData>) {
    const { count } = await db.sectionExample.updateMany({
      where: { id, section: { author: { userId } } },
      data,
    });
    if (count === 0) throw new NotFoundError();
    return db.sectionExample.findUnique({ where: { id } });
  },

  async remove(userId: string, id: string) {
    const { count } = await db.sectionExample.deleteMany({
      where: { id, section: { author: { userId } } },
    });
    if (count === 0) throw new NotFoundError();
  },
};
