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
    console.log('[DEBUG] SectionTemplateService - create() called with:', {
      id: data.id,
      label: data.label,
      hasContent: !!data.content,
      contentType: typeof data.content,
      hasSlotsSpec: !!data.slotsSpec,
      slotsSpecType: typeof data.slotsSpec,
      version: data.version,
      isDeprecated: data.isDeprecated,
    });

    const result = db.sectionTemplate.create({ data });

    console.log('[DEBUG] SectionTemplateService - create() completed for ID:', data.id);
    return result;
  },

  list() {
    console.log('[DEBUG] SectionTemplateService - list() called');
    const result = db.sectionTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    console.log('[DEBUG] SectionTemplateService - list() completed');
    return result;
  },

  get(id: string) {
    console.log('[DEBUG] SectionTemplateService - get() called with ID:', id);
    const result = db.sectionTemplate.findUnique({ where: { id } });
    console.log('[DEBUG] SectionTemplateService - get() completed for ID:', id);
    return result;
  },

  async update(id: string, data: Partial<SectionTemplateData>) {
    console.log('[DEBUG] SectionTemplateService - update() called with:', {
      id,
      hasLabel: !!data.label,
      hasContent: !!data.content,
      hasSlotsSpec: !!data.slotsSpec,
      version: data.version,
      isDeprecated: data.isDeprecated,
    });

    const { count } = await db.sectionTemplate.updateMany({ where: { id }, data });
    if (count === 0) throw new NotFoundError();

    const result = db.sectionTemplate.findUnique({ where: { id } });
    console.log('[DEBUG] SectionTemplateService - update() completed for ID:', id);
    return result;
  },

  async remove(id: string) {
    console.log('[DEBUG] SectionTemplateService - remove() called with ID:', id);
    const { count } = await db.sectionTemplate.deleteMany({ where: { id } });
    if (count === 0) throw new NotFoundError();
    console.log('[DEBUG] SectionTemplateService - remove() completed for ID:', id);
  },
};
