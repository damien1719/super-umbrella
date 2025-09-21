import { prisma } from '../../prisma';
import { answersToMarkdown, type Question } from '../../utils/answersMarkdown';
import { buildSectionPromptContext } from './promptContext';

export async function buildInstanceNotesContext(
  userId: string,
  instanceId: string,
): Promise<{ contentNotes: Record<string, unknown>; contextMd: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;

  const instance = await db.bilanSectionInstance.findUnique({
    where: { id: instanceId },
    include: {
      section: { select: { id: true, title: true, schema: true } },
    },
  });

  if (!instance) {
    throw new Error('Bilan section instance not found');
  }

  const contentNotes = ((instance.contentNotes || {}) as Record<string, unknown>);
  const schemaQuestions: Question[] = Array.isArray(instance.section?.schema)
    ? (instance.section?.schema as Question[])
    : [];

  let rawContextMd = '';
  try {
    rawContextMd = answersToMarkdown(schemaQuestions, contentNotes);
  } catch {
    // Non bloquant: si la markdownification échoue, on envoie un contexte vide
    rawContextMd = '';
  }

  const promptContext = await buildSectionPromptContext({
    userId,
    bilanId: instance.bilanId,
    baseContent: rawContextMd,
    sectionId: instance.sectionId,
    fallbackSectionTitle: instance.section?.title,
  });

  return {
    contentNotes,
    contextMd: promptContext.content,
  };
}

