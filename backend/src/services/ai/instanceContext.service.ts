import { prisma } from '../../prisma';
import { type Question } from '../../utils/answersMarkdown';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type InstanceContext = {
  bilanId: string;
  sectionId: string;
  sectionTitle?: string | null;
  sectionKind?: string | null;
  sectionQuestions: Question[];
  userId?: string;
  patientNames?: { firstName?: string; lastName?: string };
  contentNotes: Record<string, unknown>;
};

function ensureQuestionArray(schema: unknown): Question[] {
  return Array.isArray(schema) ? (schema as Question[]) : [];
}

type CacheEntry = { expiresAt: number; promise: Promise<InstanceContext> };
const CACHE_TTL_MS = 5_000; // small TTL to dedupe calls during a request burst
const instanceCtxCache = new Map<string, CacheEntry>();

export async function getInstanceContext(instanceId: string): Promise<InstanceContext> {
  const now = Date.now();
  const cached = instanceCtxCache.get(instanceId);
  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = (async (): Promise<InstanceContext> => {
    const instance = await db.bilanSectionInstance.findUnique({
      where: { id: instanceId },
      include: {
        bilan: {
          select: {
            id: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
                profile: { select: { userId: true } },
              },
            },
          },
        },
        section: {
          select: { id: true, title: true, kind: true, schema: true },
        },
      },
    });

    if (!instance) throw new Error('BilanSectionInstance not found');

    const sectionQuestions = ensureQuestionArray(instance.section?.schema);
    const patient = instance.bilan?.patient;
    const patientNames = patient
      ? { firstName: patient.firstName ?? undefined, lastName: patient.lastName ?? undefined }
      : undefined;

    return {
      bilanId: instance.bilanId,
      sectionId: instance.sectionId,
      sectionTitle: instance.section?.title ?? null,
      sectionKind: instance.section?.kind ?? null,
      sectionQuestions,
      userId: patient?.profile?.userId ?? undefined,
      patientNames,
      contentNotes: ((instance.contentNotes || {}) as Record<string, unknown>),
    } satisfies InstanceContext;
  })();

  instanceCtxCache.set(instanceId, { promise, expiresAt: now + CACHE_TTL_MS });
  return promise;
}

export async function getSectionQuestions(instanceId: string): Promise<Question[]> {
  const ctx = await getInstanceContext(instanceId);
  return ctx.sectionQuestions;
}
