import { prisma } from '../prisma';
import { createHash } from 'crypto';

export type CreateStylePresetData = {
  target: 'TITLE' | 'SUBTITLE' | 'PARAGRAPH';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: any;
  visibility?: 'PUBLIC' | 'PRIVATE';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// Create a deterministic JSON string by sorting object keys recursively
// Arrays preserve order. Primitive values stringify as-is.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stableStringify(value: any): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']';
  }
  const keys = Object.keys(value).sort();
  const parts: string[] = [];
  for (const k of keys) {
    parts.push(JSON.stringify(k) + ':' + stableStringify(value[k]));
  }
  return '{' + parts.join(',') + '}';
}

// Compute a 32-char hex hash for storage (MD5 suits the 32 varchar)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeStyleHash(style: any): string {
  const canonical = stableStringify(style);
  return createHash('md5').update(canonical).digest('hex');
}

export const StylePresetService = {
  async list(params?: { target?: CreateStylePresetData['target']; includeArchived?: boolean }) {
    const where: Record<string, unknown> = {};
    if (params?.target) where.target = params.target;
    if (!params?.includeArchived) where.isArchived = false;
    return db.stylePreset.findMany({ where, orderBy: { createdAt: 'desc' } });
  },

  async findDuplicate(target: CreateStylePresetData['target'], style: unknown) {
    const styleHash = computeStyleHash(style);
    return db.stylePreset.findFirst({ where: { target, styleHash, isArchived: false } });
  },

  async createOrGet(data: CreateStylePresetData) {
    const styleHash = computeStyleHash(data.style);
    const existing = await db.stylePreset.findFirst({ where: { target: data.target, styleHash, isArchived: false } });
    if (existing) return { created: false as const, preset: existing };

    try {
      const preset = await db.stylePreset.create({
        data: {
          target: data.target,
          style: data.style,
          styleHash,
          visibility: data.visibility ?? 'PUBLIC',
        },
      });
      return { created: true as const, preset };
    } catch (e: unknown) {
      // Handle race-condition on unique constraint [target, styleHash]
      if (typeof e === 'object' && e && (e as any).code === 'P2002') {
        const preset = await db.stylePreset.findFirst({ where: { target: data.target, styleHash } });
        if (preset) return { created: false as const, preset };
      }
      throw e;
    }
  },

  // Optional helper: upsert by (target, styleHash)
  async upsert(data: CreateStylePresetData) {
    const styleHash = computeStyleHash(data.style);
    // Prefer returning existing non-archived record if present
    const existing = await db.stylePreset.findFirst({ where: { target: data.target, styleHash, isArchived: false } });
    if (existing) return { created: false as const, preset: existing };
    const preset = await db.stylePreset.upsert({
      where: { target_styleHash: { target: data.target, styleHash } },
      update: {
        style: data.style,
        visibility: data.visibility ?? 'PUBLIC',
        isArchived: false,
      },
      create: {
        target: data.target,
        style: data.style,
        styleHash,
        visibility: data.visibility ?? 'PUBLIC',
      },
    });
    return { created: true as const, preset };
  },

  // Optional helper: update by id; recompute hash if style is provided
  async updateById(id: string, data: Partial<CreateStylePresetData>) {
    const patch: Record<string, unknown> = {};
    if (data.style !== undefined) {
      patch.style = data.style;
      patch.styleHash = computeStyleHash(data.style);
    }
    if (data.target !== undefined) patch.target = data.target;
    if (data.visibility !== undefined) patch.visibility = data.visibility;

    // If we would collide on (target, styleHash), surface a friendly error
    if (patch.styleHash && (patch.target || true)) {
      const current = await db.stylePreset.findUnique({ where: { id } });
      const target = (patch.target as CreateStylePresetData['target']) ?? current?.target;
      const dup = await db.stylePreset.findFirst({ where: { id: { not: id }, target, styleHash: patch.styleHash, isArchived: false } });
      if (dup) {
        return { updated: false as const, duplicateOf: dup };
      }
    }

    const preset = await db.stylePreset.update({ where: { id }, data: patch });
    return { updated: true as const, preset };
  },
};
