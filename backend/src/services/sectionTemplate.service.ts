import { prisma } from '../prisma';
import { NotFoundError } from './profile.service';
import {
  layoutToSchema,
  normalizeGenPartsSpecPayload,
  type GenPartsSpec,
  type LexicalState,
  type TemplateSyncReport,
} from './templateSync.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SectionTemplateData = {
  id: string;
  label: string;
  version?: number;
  content: unknown;
  slotsSpec: unknown;
  genPartsSpec?: unknown;
  isDeprecated?: boolean;
};

export interface SectionTemplateUpdateResult {
  template: unknown;
  schema?: unknown;
  genPartsSpec: GenPartsSpec;
  report: TemplateSyncReport;
}

function ensureLexicalState(input: unknown): LexicalState {
  if (!input || typeof input !== 'object') return { root: { type: 'root', children: [] } };
  const candidate = input as LexicalState;
  if (candidate.root && typeof candidate.root === 'object') return candidate;
  return { root: { type: 'root', children: [] } };
}

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

    const contentState = ensureLexicalState(data.content);
    const syncResult = layoutToSchema(contentState, []);

    const payload = {
      id: data.id,
      label: data.label,
      version: data.version,
      content: syncResult.content,
      slotsSpec: data.slotsSpec,
      genPartsSpec: syncResult.genPartsSpec,
      isDeprecated: data.isDeprecated ?? false,
    };

    const result = db.sectionTemplate.create({ data: payload });

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

  async update(id: string, data: Partial<SectionTemplateData>): Promise<SectionTemplateUpdateResult> {
    console.log('[DEBUG] SectionTemplateService - update() called with:', {
      id,
      hasLabel: !!data.label,
      hasContent: !!data.content,
      hasSlotsSpec: !!data.slotsSpec,
      version: data.version,
      isDeprecated: data.isDeprecated,
    });
    const template = await db.sectionTemplate.findUnique({
      where: { id },
      include: { sections: { select: { id: true, schema: true } } },
    });
    if (!template) throw new NotFoundError();

    const contentProvided = data.content !== undefined;
    const contentState = contentProvided
      ? ensureLexicalState(data.content)
      : ensureLexicalState(template.content);

    const baseSchema = Array.isArray(template.sections?.[0]?.schema)
      ? template.sections[0].schema
      : [];

    const existingGenPartsSpec = normalizeGenPartsSpecPayload(template.genPartsSpec);

    const syncResult = contentProvided
      ? layoutToSchema(contentState, baseSchema)
      : {
          schema: baseSchema,
          content: contentState,
          genPartsSpec: existingGenPartsSpec,
          report: {
            createdPlaceholderIds: [],
            reusedPlaceholderIds: [],
            removedPlaceholderIds: [],
            splitPlaceholderIds: [],
            injectedHeadingIds: [],
            addedQuestionIds: [],
            removedQuestionIds: [],
            notes: [],
          },
        };

    const updatePayload: Record<string, unknown> = {
      label: data.label ?? template.label,
      version: data.version ?? template.version,
      content: syncResult.content,
      slotsSpec: data.slotsSpec ?? template.slotsSpec,
      genPartsSpec: syncResult.genPartsSpec,
      isDeprecated: data.isDeprecated ?? template.isDeprecated,
    };

    const updatedTemplate = await db.sectionTemplate.update({
      where: { id },
      data: updatePayload,
    });

    if (contentProvided && template.sections?.length) {
      await db.section.updateMany({
        where: { templateRefId: id },
        data: { schema: syncResult.schema },
      });
    }

    console.log('[DEBUG] SectionTemplateService - update() completed for ID:', id);
    return {
      template: updatedTemplate,
      schema: contentProvided ? syncResult.schema : undefined,
      genPartsSpec: syncResult.genPartsSpec,
      report: syncResult.report,
    };
  },

  async remove(id: string) {
    console.log('[DEBUG] SectionTemplateService - remove() called with ID:', id);
    const { count } = await db.sectionTemplate.deleteMany({ where: { id } });
    if (count === 0) throw new NotFoundError();
    console.log('[DEBUG] SectionTemplateService - remove() completed for ID:', id);
  },
};
