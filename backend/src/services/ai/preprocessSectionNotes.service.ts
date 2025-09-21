import { answersToMarkdown } from '../../utils/answersMarkdown';
import { buildSectionPromptContext } from './promptContext';
import { getInstanceContext } from './instanceContext.service';

export async function buildInstanceNotesContext(
  userId: string,
  instanceId: string,
): Promise<{ contentNotes: Record<string, unknown>; contextMd: string }> {
  const ctx = await getInstanceContext(instanceId);
  const contentNotes = ctx.contentNotes;
  const schemaQuestions = ctx.sectionQuestions;

  let rawContextMd = '';
  try {
    rawContextMd = answersToMarkdown(schemaQuestions, contentNotes);
  } catch {
    // Non bloquant: si la markdownification échoue, on envoie un contexte vide
    rawContextMd = '';
  }

  const promptContext = await buildSectionPromptContext({
    userId,
    bilanId: ctx.bilanId,
    baseContent: rawContextMd,
    sectionId: ctx.sectionId,
    fallbackSectionTitle: ctx.sectionTitle,
  });

  return {
    contentNotes,
    contextMd: promptContext.content,
  };
}
