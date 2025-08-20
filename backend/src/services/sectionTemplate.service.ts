import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SectionTemplateData = {
  id: string;
  label: string;
  version?: number;
  content: unknown;
  slotsSpec: unknown;
  isDeprecated?: boolean;
};

export const SectionTemplateService = {
  create(data: SectionTemplateData) {
    return db.sectionTemplate.create({ data });
  },

  list() {
    return db.sectionTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  },

  get(id: string) {
    return db.sectionTemplate.findUnique({ where: { id } });
  },

  async update(id: string, data: Partial<SectionTemplateData>) {
    const { count } = await db.sectionTemplate.updateMany({ where: { id }, data });
    if (count === 0) throw new NotFoundError();
    return db.sectionTemplate.findUnique({ where: { id } });
  },

  async remove(id: string) {
    const { count } = await db.sectionTemplate.deleteMany({ where: { id } });
    if (count === 0) throw new NotFoundError();
  },
};
