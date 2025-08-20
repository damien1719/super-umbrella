import { prisma } from '../../prisma';
import { SectionTemplateService } from '../sectionTemplate.service';
import { openaiProvider } from './providers/openai.provider';
import { z } from 'zod';

type Notes = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export type SlotSpec = {
  mode: 'user' | 'computed' | 'llm';
  type: 'text' | 'number' | 'list' | 'table';
  pattern?: string;
  deps?: string[];
  prompt?: string;
};

function normalizeSlotsSpec(raw: unknown): Record<string, SlotSpec> {
  console.log('=== DEBUG normalizeSlotsSpec ===');
  console.log('raw input:', raw);

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown> & { slots?: Array<Record<string, unknown>> };

    // Si c'est déjà au format backend (avec slots indexés par ID)
    if (obj.slots && !Array.isArray(obj.slots)) {
      console.log('Already in backend format, returning as is');
      return obj.slots as Record<string, SlotSpec>;
    }

    // Si c'est au format frontend (slots comme tableau)
    if (Array.isArray(obj.slots)) {
      console.log('Converting from frontend array format');
      const out: Record<string, SlotSpec> = {};
      for (const s of obj.slots) {
        const id = typeof s.id === 'string' ? s.id : undefined;
        const mode = s.mode as SlotSpec['mode'];
        const type = s.type as SlotSpec['type'];

        if (id && type) {
          // Si pas de mode défini, on utilise 'user' par défaut
          const actualMode = mode || 'user';
          console.log(`Slot ${id}: mode=${actualMode}, type=${type}`);

          out[id] = {
            mode: actualMode,
            type,
            pattern: typeof s.pattern === 'string' ? s.pattern : undefined,
            deps: Array.isArray(s.deps) ? (s.deps as string[]) : undefined,
            prompt: typeof (s as any).prompt === 'string' ? (s as any).prompt : undefined,
          };
        }
      }
      console.log('Converted slotsSpec:', out);
      return out;
    }
  }

  console.log('Fallback: returning raw or empty object');
  return (raw as Record<string, SlotSpec>) || {};
}

function partitionSlots(spec: Record<string, SlotSpec>) {
  const res = { user: [] as string[], computed: [] as string[], llm: [] as string[] };
  for (const [id, s] of Object.entries(spec || {})) {
    res[s.mode].push(id);
  }
  return res;
}

function computeComputed(ids: string[], spec: Record<string, SlotSpec>, notes: Notes) {
  const out: Record<string, unknown> = {};
  for (const id of ids) {
    const s = spec[id];
    if (!s) continue;
    let val = s.pattern || '';
    for (const dep of s.deps || []) {
      const rep = notes?.[dep] ?? '';
      val = val.replace(new RegExp(`{${dep}}`, 'g'), String(rep));
    }
    out[id] = val;
  }
  return out;
}

function buildPrompt(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  const schema: Record<string, string> = {};
  const prompts: Record<string, string> = {};

  ids.forEach((id) => {
    schema[id] = spec[id]?.type || 'text';
    // Chercher le prompt dans les notes de contenu ou dans la spec
    const slotPrompt = (notes as any)?.[`${id}_prompt`] || (spec[id] as any)?.prompt || '';
    if (slotPrompt) {
      prompts[id] = slotPrompt;
    }
  });

  let promptText = `Remplis les champs JSON suivant ${JSON.stringify(schema)}`;

  if (Object.keys(prompts).length > 0) {
    promptText += `\n\nInstructions spécifiques par champ:\n${Object.entries(prompts).map(([id, p]) => `- ${id}: ${p}`).join('\n')}`;
  }

  if (style) {
    promptText += `\n\nStyle à respecter: ${style}`;
  }

  if (Object.keys(notes).length > 0) {
    promptText += `\n\nNotes contextuelles: ${JSON.stringify(notes)}`;
  }

  return promptText;
}

function buildZod(ids: string[], spec: Record<string, SlotSpec>) {
  const shape: Record<string, z.ZodTypeAny> = {};
  ids.forEach((id) => {
    const t = spec[id]?.type;
    switch (t) {
      case 'number':
        shape[id] = z.number();
        break;
      case 'list':
        shape[id] = z.array(z.any());
        break;
      case 'table':
        shape[id] = z.array(z.any());
        break;
      default:
        shape[id] = z.string();
    }
  });
  return z.object(shape);
}

function hydrate(ast: unknown, slots: Record<string, unknown>, spec: Record<string, SlotSpec>): unknown {
  console.log('DEBUG hydrate: input ast:', JSON.stringify(ast, null, 2));
  console.log('DEBUG hydrate: available slots:', slots);

  // Remplace récursivement les SlotNodes Lexical (type: 'slot', champ 'slotId')
  // par des nœuds 'text' Lexical valides, ou laisse intact si non reconnu.
  if (Array.isArray(ast)) {
    const result = ast.map((n) => hydrate(n, slots, spec));
    console.log('DEBUG hydrate: array result:', result);
    return result;
  }
  if (ast && typeof ast === 'object') {
    const node = ast as { type?: string; slotId?: string; children?: unknown; root?: unknown } & Record<string, unknown>;

    // Si c'est un editorState Lexical ({ root, version }), hydrater la clé root
    if (Object.prototype.hasOwnProperty.call(node, 'root')) {
      const out: Record<string, unknown> = { ...node };
      out.root = hydrate(node.root, slots, spec);
      return out;
    }

    // SlotNode sérialisé (frontend): { type: 'slot', slotId, slotType, ... }
    if (node.type === 'slot' && typeof node.slotId === 'string') {
      const slotId = node.slotId;
      const slotSpec = spec[slotId];
      const value = slots[slotId];

      // Pour l'instant, on matérialise tout en nœud texte Lexical standard
      // (le frontend sait lire: {type:'text', text:'...', ...}).
      // Si besoin, une gestion avancée des listes/tableaux pourra être ajoutée ici.
      const text = Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '');
      return {
        type: 'text',
        text,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        version: 1,
      };
    }

    // Descente récursive dans children si présents
    const out: Record<string, unknown> = { ...node };
    if (node.children !== undefined) {
      out.children = hydrate(node.children, slots, spec);
    }
    return out;
  }
  return ast;
}

async function generateLLM(ids: string[], spec: Record<string, SlotSpec>, notes: Notes, style?: string) {
  console.log('=== DEBUG generateLLM ===');
  console.log('ids:', ids);
  console.log('ids.length:', ids.length);

  if (ids.length === 0) {
    console.log('No LLM slots found, returning empty result');
    return { slots: {}, promptHash: '' };
  }

  console.log('Building prompt for LLM slots...');
  const prompt = buildPrompt(ids, spec, notes, style);
  console.log('Generated prompt:', prompt);

  const messages = [{ role: 'user', content: prompt }];
  console.log('Calling OpenAI API...');

  const raw = await openaiProvider.chat({ messages } as unknown as import('openai/resources/index').ChatCompletionCreateParams);
  console.log('OpenAI response:', raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw as string);
  } catch {
    // fallback: try to extract JSON-ish substring; if it fails, default to {}
    try {
      const text = String(raw || '');
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      parsed = start >= 0 && end > start ? JSON.parse(text.slice(start, end + 1)) : {};
    } catch {
      parsed = {};
    }
  }
  const schema = buildZod(ids, spec);
  const slots = schema.parse(parsed as object);
  return { slots, promptHash: String(prompt.length) };
}

export async function generateFromTemplate(
  sectionTemplateId: string,
  contentNotes: Notes,
  opts: { instanceId: string; userSlots?: Record<string, unknown>; stylePrompt?: string; model?: string },
) {
  const template = await SectionTemplateService.get(sectionTemplateId);
  if (!template) throw new Error('Template not found');
  const ast = template.content;
  const slotsSpec = normalizeSlotsSpec(template.slotsSpec);
  const parts = partitionSlots(slotsSpec);

  console.log('=== DEBUG generateFromTemplate ===');
  console.log('sectionTemplateId:', sectionTemplateId);
  console.log('template.slotsSpec:', template.slotsSpec);
  console.log('normalized slotsSpec:', slotsSpec);
  console.log('parts:', parts);
  console.log('contentNotes:', contentNotes);
  console.log('userSlots:', opts.userSlots);
  console.log('stylePrompt:', opts.stylePrompt);

  const computed = computeComputed(parts.computed, slotsSpec, contentNotes);
  console.log('computed slots:', computed);

  const llm = await generateLLM(parts.llm, slotsSpec, contentNotes, opts.stylePrompt);
  console.log('llm result:', llm);

  const slots = { ...(opts.userSlots || {}), ...computed, ...llm.slots };
  console.log('final slots:', slots);

        const hydratedState = hydrate(ast, slots, slotsSpec);
      console.log('DEBUG: hydratedState:', hydratedState);

      // Ensure we have a proper Lexical editor state structure
      const editorState = {
        root: (hydratedState as any)?.root || hydratedState,
        version: 1
      };

      const assembledState = JSON.stringify(editorState);
  console.log('DEBUG: assembledState (stringified):', assembledState);

  await db.bilanSectionInstance.update({
    where: { id: opts.instanceId },
    data: {
      generatedContent: { slots, assembledState },
      templateIdUsed: sectionTemplateId,
      templateVersionUsed: template.version,
      generatedContentUpdatedAt: new Date(),
    },
  });
  return { slots, assembledState };
}

export async function regenerateSlots(instanceId: string, slotIds: string[]) {
  const instance = await db.bilanSectionInstance.findUnique({ where: { id: instanceId } });
  if (!instance?.templateIdUsed) throw new Error('Template missing');
  const template = await SectionTemplateService.get(instance.templateIdUsed);
  if (!template) throw new Error('Template not found');
  const slotsSpec = normalizeSlotsSpec(template.slotsSpec);
  const parts = partitionSlots(slotsSpec);
  const computedIds = slotIds.filter((id) => parts.computed.includes(id));
  const llmIds = slotIds.filter((id) => parts.llm.includes(id));
  const computed = computeComputed(computedIds, slotsSpec, instance.contentNotes as Notes);
  const llm = await generateLLM(llmIds, slotsSpec, instance.contentNotes as Notes, undefined);
  const existing = (instance.generatedContent as Record<string, unknown>)?.slots || {};
  const slots = { ...existing, ...computed, ...llm.slots };
  const hydratedState = hydrate(template.content, slots, slotsSpec);

  // Ensure we have a proper Lexical editor state structure
  const editorState = {
    root: (hydratedState as any)?.root || hydratedState,
    version: 1
  };

  const assembledState = JSON.stringify(editorState);

  await db.bilanSectionInstance.update({
    where: { id: instanceId },
    data: {
      generatedContent: { ...(instance.generatedContent as Record<string, unknown>), slots, assembledState },
      generatedContentUpdatedAt: new Date(),
    },
  });
  return { slots, assembledState };
}

export const _test = { partitionSlots, computeComputed, buildPrompt, buildZod, hydrate };
