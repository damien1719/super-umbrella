import { prisma } from '../prisma';
import { randomUUID } from 'crypto';
import { NotFoundError } from './profile.service';
import type { Job } from '../types/job';
import { isAdminUser } from '../utils/admin';
import { schemaToLayout, type LexicalState } from './templateSync.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

function ensureLexicalState(input: unknown): LexicalState {
  if (!input || typeof input !== 'object') {
    return { root: { type: 'root', format: '', indent: 0, direction: 'ltr', version: 1, children: [] } };
  }
  const candidate = input as LexicalState;
  if (candidate.root && typeof candidate.root === 'object') return candidate;
  return { root: { type: 'root', format: '', indent: 0, direction: 'ltr', version: 1, children: [] } };
}

async function syncTemplateFromSchema(section: any): Promise<void> {
  if (!section?.templateRefId) return;
  const schema = Array.isArray(section?.schema) ? section.schema : null;
  if (!schema) return;

  const template = await db.sectionTemplate.findUnique({ where: { id: section.templateRefId } });
  if (!template) return;

  // Do not trigger template sync when the template version is 1
  // (legacy templates should not be auto-synchronized)
  if (typeof template.version === 'number' && template.version === 1) {
    return;
  }

  const previousLayout = ensureLexicalState(template.content);
  const syncResult = schemaToLayout(schema, previousLayout, template.genPartsSpec);

  await db.sectionTemplate.update({
    where: { id: section.templateRefId },
    data: {
      content: syncResult.content,
      genPartsSpec: syncResult.genPartsSpec,
    },
  });

  section.templateRef = {
    ...(section.templateRef ?? template),
    content: syncResult.content,
    genPartsSpec: syncResult.genPartsSpec,
  };
}

type LexNode = Record<string, any> & { type?: string; children?: any[] };

/**
 * Supprime uniquement les nœuds { type: 'section-placeholder', sectionId: targetId }
 * dans un state Lexical. Ne touche à rien d'autre.
 */
function pruneSectionPlaceholders(
  layout: unknown,
  targetId: string,
): unknown {
  const base = ensureLexicalState(layout);

  // Retourne:
  // - un nouvel objet nœud si ses enfants ont changé,
  // - le nœud original s'il est inchangé,
  // - null si le nœud doit être supprimé.
  function pruneNode(node: any): any | null {
    if (!node || typeof node !== 'object') return node;

    // 1) Cas suppression ciblée
    if (node.type === 'section-placeholder' && node.sectionId === targetId) {
      return null; // on le retire
    }

    // 2) Traiter récursivement children (s'il y en a)
    const hasChildren = Array.isArray(node.children);
    if (!hasChildren) return node;

    let changed = false;
    const nextChildren: any[] = [];
    for (const child of node.children as any[]) {
      const pruned = pruneNode(child);
      if (pruned === null) {
        changed = true; // un enfant supprimé
        continue;
      }
      if (pruned !== child) changed = true; // enfant modifié
      nextChildren.push(pruned);
    }

    if (!changed) return node; // rien n'a changé sous ce nœud

    // Recréer seulement si nécessaire (immutabilité)
    return { ...node, children: nextChildren };
  }

  const nextRoot = pruneNode((base as any).root);
  // root n'est jamais supprimé; au pire on garde root tel quel
  if (nextRoot === (base as any).root) return base;
  return { ...(base as any), root: nextRoot };
}


export type SectionData = {
  title: string;
  kind: string;
  job: Job[];
  description?: string | null;
  schema?: unknown;
  defaultContent?: unknown;
  isPublic?: boolean;
  templateRefId?: string | null;
  templateOptions?: unknown;
  version?: number;
  astSnippets?: Record<string, unknown> | null;
  // new: allow setting the Section source (admin UI only)
  source?: 'USER' | 'BILANPLUME';
};


export const SectionService = {
  async create(userId: string, data: SectionData) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    // Ensure newly created Sections have a minimal default schema
    // If caller did not provide a non-empty schema, inject [1 title + 1 notes]
    const hasSchema =
      Array.isArray((data as any).schema) && (data as any).schema.length > 0;
    const defaultSchema = [
      { id: `${Date.now()}`, type: 'titre', titre: data.title },
      {
        id: `${Date.now() + 1}`,
        type: 'notes',
        titre: '',
        contenu: '',
      },
    ];

    const payload = {
      ...data,
      schema: hasSchema ? (data as any).schema : (defaultSchema as unknown),
      authorId: profile.id,
    } as const;

    const created = await db.section.create({
      data: payload,
      include: { templateRef: true },
    });

    //await syncTemplateFromSchema(created);
    return created;
  },

  async list(userId: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const shareClause = {
      shares: {
        some: {
          OR: [
            { invitedUserId: userId },
            ...(email ? [{ invitedEmail: email }] : []),
          ],
        },
      },
    };
    return db.section.findMany({
      where: {
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { prenom: true } }, templateRef: true },
    });
  },

  async get(userId: string, id: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const shareClause = {
      shares: {
        some: {
          OR: [
            { invitedUserId: userId },
            ...(email ? [{ invitedEmail: email }] : []),
          ],
        },
      },
    };
    return db.section.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      include: { author: { select: { prenom: true } }, templateRef: true },
    });
  },

  async duplicate(userId: string, id: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found for user');
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const shareClause = {
      shares: {
        some: {
          OR: [
            { invitedUserId: userId },
            ...(email ? [{ invitedEmail: email }] : []),
          ],
        },
      },
    };
    const section = await db.section.findFirst({
      where: {
        id,
        OR: [
          { isPublic: true },
          { author: { userId } },
          shareClause,
        ],
      },
      include: { templateRef: true },
    });
    if (!section) throw new NotFoundError();

    // If there is an associated template, clone it and link to the duplicated section
    if (section.templateRefId && section.templateRef) {
      const newTemplateId = randomUUID();
      const newTemplateData = {
        id: newTemplateId,
        label: `${section.templateRef.label} - Copie`,
        version: section.templateRef.version ?? 1,
        content: section.templateRef.content,
        slotsSpec: section.templateRef.slotsSpec,
        genPartsSpec: section.templateRef.genPartsSpec ?? {},
        isDeprecated: false,
      } as const;

      const [, createdSection] = await db.$transaction([
        db.sectionTemplate.create({ data: newTemplateData }),
        db.section.create({
          data: {
            title: section.title + ' - Copie',
            kind: section.kind,
            job: section.job,
            description: section.description,
            schema: section.schema,
            defaultContent: section.defaultContent,
            isPublic: false,
            authorId: profile.id,
            templateRefId: newTemplateId,
            templateOptions: section.templateOptions,
            version: section.version,
            astSnippets: section.astSnippets,
          },
          include: { templateRef: true },
        }),
      ]);
      return createdSection;
    }

    // No template associated: duplicate as-is without linking to any template
    return db.section.create({
      data: {
        title: section.title + ' - Ma version',
        kind: section.kind,
        job: section.job,
        description: section.description,
        schema: section.schema,
        defaultContent: section.defaultContent,
        isPublic: false,
        authorId: profile.id,
        templateRefId: null,
        templateOptions: section.templateOptions,
        version: section.version,
        astSnippets: section.astSnippets,
      },
      include: { templateRef: true },
    });
  },

  async update(userId: string, id: string, data: Partial<SectionData>) {
    // Admins may update any field, including source
    const requiresSync = Object.prototype.hasOwnProperty.call(data, 'schema');

    if (await isAdminUser(userId)) {
      const updated = await db.section.update({ where: { id }, data, include: { templateRef: true } });
      if (requiresSync) {
        //await syncTemplateFromSchema(updated);
      }
      return updated;
    }
    // For non-admins, prevent source changes even if passed accidentally
    const rest = { ...(data as Partial<SectionData>) };
    if ('source' in rest) {
      delete (rest as { source?: SectionData['source'] }).source;
    }
    // Support shares granted by email OR by userId (like list/get)
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const { count } = await db.section.updateMany({
      where: {
        id,
        OR: [
          { author: { userId } },
          {
            shares: {
              some: {
                role: 'EDITOR',
                OR: [
                  { invitedUserId: userId },
                  ...(email ? [{ invitedEmail: email }] : []),
                ],
              },
            },
          },
        ],
      },
      data: rest,
    });
    if (count === 0) throw new NotFoundError();
    const section = await db.section.findUnique({ where: { id }, include: { templateRef: true } });
    if (section && requiresSync) {
      //await syncTemplateFromSchema(section);
    }
    return section;
  },

  async remove(userId: string, id: string) {
    // Precompute impacted BilanTypes (by join table) before delete cascade
    const impacted: { bilanTypeId: string }[] = await db.bilanTypeSection.findMany({
      where: { sectionId: id },
      select: { bilanTypeId: true },
    });
    const impactedIds = Array.from(new Set(impacted.map((r) => r.bilanTypeId)));

    if (await isAdminUser(userId)) {
      await db.section.delete({ where: { id } });
      // After delete, prune layouts for impacted BilanTypes
      if (impactedIds.length > 0) {
        const items = await db.bilanType.findMany({
          where: { id: { in: impactedIds } },
          select: { id: true, layoutJson: true },
        });
        for (const bt of items) {
          const pruned = pruneSectionPlaceholders(bt.layoutJson, id);
          // only update if changed
          if (JSON.stringify(pruned) !== JSON.stringify(bt.layoutJson)) {
            await db.bilanType.update({ where: { id: bt.id }, data: { layoutJson: pruned } });
          }
        }
      }
      return;
    }
    // Vérifier droits: auteur ou éditeur via partage (userId or email)
    const profile = await db.profile.findUnique({ where: { userId } });
    const email = (profile?.email as string | undefined)?.trim().toLowerCase();
    const { count } = await db.section.deleteMany({
      where: {
        id,
        OR: [
          { author: { userId } },
          {
            shares: {
              some: {
                role: 'EDITOR',
                OR: [
                  { invitedUserId: userId },
                  ...(email ? [{ invitedEmail: email }] : []),
                ],
              },
            },
          },
        ],
      },
    });
    if (count === 0) throw new NotFoundError();
    // Prune layouts post-delete for impacted BilanTypes
    if (impactedIds.length > 0) {
      const items = await db.bilanType.findMany({
        where: { id: { in: impactedIds } },
        select: { id: true, layoutJson: true },
      });
      for (const bt of items) {
        const pruned = pruneSectionPlaceholders(bt.layoutJson, id);
        if (JSON.stringify(pruned) !== JSON.stringify(bt.layoutJson)) {
          await db.bilanType.update({ where: { id: bt.id }, data: { layoutJson: pruned } });
        }
      }
    }
  },
};
