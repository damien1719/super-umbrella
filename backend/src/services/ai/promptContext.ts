import { prisma } from '../../prisma';
import { BilanService } from '../bilan.service';

type PatientNames = { firstName?: string; lastName?: string };

export function prependSectionContext(content: string, sectionName?: string | null): string {
  const name = (sectionName ?? "").toString().trim();
  if (!name) return content;
  return `Contexte: "### ${name}" ---\n${content}`;
}

export type BuildSectionPromptContextOptions = {
  userId: string;
  bilanId: string;
  baseContent: string;
  sectionId?: string;
  fallbackSectionTitle?: string | null;
  prependSectionTitle?: boolean;
  patientNames?: PatientNames;
};

export type BuildSectionPromptContextResult = {
  content: string;
  patientNames: PatientNames;
  sectionTitle?: string;
};

async function resolvePatientNames(
  userId: string,
  bilanId: string,
  provided?: PatientNames,
): Promise<PatientNames> {
  const initial: PatientNames = { ...provided };
  if (initial.firstName || initial.lastName) return initial;

  try {
    const patient = await BilanService.get(userId, bilanId);
    if (patient && typeof patient === 'object') {
      const p = patient as {
        firstName?: string;
        lastName?: string;
        patient?: { firstName?: string; lastName?: string };
      };
      return {
        firstName: p.firstName || p.patient?.firstName,
        lastName: p.lastName || p.patient?.lastName,
      };
    }
  } catch {
    // Non-bloquant: absence de noms patient n'empêche pas la génération
  }
  return initial;
}

async function resolveSectionTitle(
  sectionId: string | undefined,
  fallback?: string | null,
): Promise<string | undefined> {
  if (!sectionId) return fallback ?? undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const section = await db.section.findUnique({ where: { id: sectionId } });
    if (section && typeof section.title === 'string' && section.title.trim().length > 0) {
      return section.title;
    }
  } catch {
    // Non-bloquant: on retombe sur le fallback
  }
  return fallback ?? undefined;
}

export async function buildSectionPromptContext(
  options: BuildSectionPromptContextOptions,
): Promise<BuildSectionPromptContextResult> {
  const {
    userId,
    bilanId,
    baseContent,
    sectionId,
    fallbackSectionTitle,
    prependSectionTitle,
    patientNames: providedPatientNames,
  } = options;

  const patientNames = await resolvePatientNames(userId, bilanId, providedPatientNames);
  const sectionTitle = await resolveSectionTitle(sectionId, fallbackSectionTitle);

  let content = typeof baseContent === 'string' ? baseContent : String(baseContent ?? '');
  const firstName = typeof patientNames.firstName === 'string' ? patientNames.firstName.trim() : '';

  if (firstName.length > 0) {
    content = `Prenom: "${firstName}"\nNotes brutes: "${content}`;
  }

  if (prependSectionTitle && sectionTitle) {
    content = prependSectionContext(content, sectionTitle);
  }

  return {
    content,
    patientNames,
    sectionTitle,
  };
}
