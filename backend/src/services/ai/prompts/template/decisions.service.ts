// src/services/ai/prompts/template/decisions.service.ts
// === APPEL 2 :  Construction AST ===
import { openaiProvider } from '../../providers/openai.provider';
import type { Request, Response } from 'express';
import type { PlanResolved } from './plan.service';
import type { SlotSpec, SlotType } from '../../../../types/template';

const IMPORT_MAGIQUE_MODEL = 'gpt-4.1';

/* =========================
 * 1) TYPES POUR L'APPEL 2
 * ========================= */
export type SequenceItem =
  | { kind: 'title'; for: string; text: string }
  | { kind: 'boilerplate'; for: string; text: string }
  | { kind: 'slot'; slotId: string };

export type SequencePayload = {
  sequence: SequenceItem[];
};

type LexicalText = {
  type: 'text';
  text: string;
  detail: 0;
  format: 0;
  mode: 'normal';
  style: '';
  version: 1;
};

type LexicalSlot = {
  type: 'slot';
  slotId: string;
  slotLabel?: string;
  slotType: SlotType;
  optional: boolean;
  placeholder: string;
  version: 1;
};

type LexicalParagraph = {
  type: 'paragraph';
  children: Array<LexicalText | LexicalSlot>;
  direction: null;
  format: '';
  indent: 0;
  version: 1;
};

export type LexicalAST = {
  root: {
    type: 'root';
    children: LexicalParagraph[];
    direction: null;
    format: '';
    indent: 0;
    version: 1;
  };
};

// Instances de slots (répétiteurs étendus)
export type SlotInstance = {
  slotId: string;
  label: string;
  item: string;
  type?: SlotType;
  placeholder?: string;
  optional?: boolean;
};

// Décisions Appel 2
export type Decision = {
  slotId: string;
  lineIndex: number;
  charOffset: number;
  confidence?: number;
  reason?: string;
};

export type DecisionsPayload = {
  decisions: Decision[];
};

// Sortie finale
export type TemplatePayload = {
    content: LexicalAST;
    slotsSpec: SlotSpec[];
    label: string;
};

/* =========================
 * 2) HELPERS TEXTE + INSTANCES
 * ========================= */

function safeJsonParse<T>(raw: string): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error('Réponse LLM non-JSON ou invalide.');
    }
  }
  













/* =========================
 * 3) SCHÉMA & PROMPTS APPEL 2
 * ========================= */


// Nouveau schéma pour l'approche séquence
export const SEQUENCE_SCHEMA = {
    name: "SequenceLayout",
    strict: true,
    schema: {
      type: "object",
      properties: {
        sequence: {
          type: "array",
          minItems: 1,
          maxItems: 500,
          items: {
            type: "object",
            properties: {
              kind: { type: "string", enum: ["title", "boilerplate", "slot"] },
              // requis mais peut être vide ("") quand kind = "slot"
              for: {
                type: "string",
                minLength: 0,
                maxLength: 80,
                pattern: "^[a-z0-9._-]*$"
              },
              // requis mais peut être vide ("") quand kind = "slot"
              text: {
                type: "string",
                minLength: 0,
                maxLength: 240
              },
              // requis mais peut être vide ("") quand kind ≠ "slot"
              slotId: {
                type: "string",
                minLength: 0,
                maxLength: 200,
                pattern: "^[a-z0-9]+(?:[._-][a-z0-9]+)*$|^$"
              }
            },
            required: ["kind", "for", "text", "slotId"],
            additionalProperties: false
          }
        }
      },
      required: ["sequence"],
      additionalProperties: false
    }
  } as const;
  
  

/* =========================
 * 4) NOUVELLE APPROCHE SÉQUENCE
 * ========================= */

// Prompt pour le sequençage
const SYSTEM_SEQUENCER = `Tu es un assistant de mise en page. Objectif : créer une séquence logique d'éléments pour structurer un template éditorial.

Rôles :
- Déterminer l'ordre optimal des sections
- Ajouter des titres descriptifs pour chaque partie
- Inclure de petits boilerplates si nécessaire
- Placer les slots aux bons endroits logiques

Types d'éléments :
- "title" : titre de section (ex: "Olfactif", "Auditif (Score)")
- "boilerplate" : petit texte explicatif (ex: "Évaluez les aspects suivants :")
- "slot" : emplacement pour un champ à remplir

Règles :
- Commencer par un titre quand c'est logique
- Grouper les slots liés ensemble
- Utiliser des titres descriptifs et naturels
- Garder les boilerplates courts et utiles
- Respecter l'ordre logique du contenu source

Réponds uniquement en JSON valide selon le schéma fourni.`;

function buildSequencerPrompt(sourceText: string, plan: PlanResolved): string {
  // Construire la liste des slots disponibles avec leurs IDs
  const allSlots: Array<{ slotId: string; label: string; repeater?: string }> = [];

  // Slots simples
  plan.slots.forEach(slot => {
            allSlots.push({
          slotId: slot.id,
          label: slot.label || ''
        });
  });

  // Slots de répéteurs
  plan.repeaters.forEach(repeater => {
    repeater.slots.forEach(slot => {
      repeater.items.forEach(item => {
        const slotId = `${repeater.id}.${item.key}.${slot.id}`;
        allSlots.push({
          slotId,
          label: slot.label || '',
          repeater: item.label
        });
      });
    });
  });

  return [
    `### Texte source à structurer:`,
    '"""',
    sourceText,
    '"""',
    '',
    `### Plan disponible:`,
    `- Label: ${plan.label}`,
    `- Slots simples: ${plan.slots.map(s => `${s.id} (${s.label})`).join(', ')}`,
    `- Répéteurs: ${plan.repeaters.map(r => `${r.name} [${r.items.map(i => i.label).join(', ')}]`).join(', ')}`,
    '',
    `### Slots disponibles:`,
    allSlots.map((slot, idx) => `${idx + 1}. ${slot.slotId} - ${slot.label}${slot.repeater ? ` (pour ${slot.repeater})` : ''}`).join('\n'),
    '',
    `### Instructions:`,
    `Crée une séquence logique en utilisant les slots disponibles.`,
    `Chaque slot doit être référencé exactement une fois.`,
    `Ajoute des titres et boilerplates pour structurer le contenu.`,
    `Utilise des noms de titres naturels et descriptifs.`,
    '',
    `Format de sortie: { "sequence": [éléments] }`,
  ].join('\n');
}

// Nouvelle fonction pour générer la séquence
async function generateSequenceWithLLM(sourceText: string, plan: PlanResolved): Promise<SequencePayload> {
  const user = buildSequencerPrompt(sourceText, plan);


  const raw = await openaiProvider.chat({
    model: IMPORT_MAGIQUE_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_SEQUENCER },
      { role: 'user', content: user },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: SEQUENCE_SCHEMA,
    },
  });

  const parsed = safeJsonParse<SequencePayload>(raw || '{}');

  return parsed;
}

// Fonction déterministe pour construire l'AST à partir de la séquence
function buildAstFromSequence(plan: PlanResolved, sequence: SequencePayload): LexicalAST {

  const paragraphs: LexicalParagraph[] = [];
  let currentParagraph: Array<LexicalText | LexicalSlot> = [];

  // Helper pour trouver un slot dans le plan
  const findSlotInPlan = (slotId: string) => {
    // Chercher d'abord dans les slots simples
    let slot = plan.slots.find(s => s.id === slotId);
    if (slot) return slot;

    // Chercher dans les répéteurs
    for (const repeater of plan.repeaters) {
      for (const item of repeater.items) {
        for (const slot of repeater.slots) {
            const expectedId = `${repeater.id}.${item.key}.${slot.id}`;
          if (expectedId === slotId) {
            return {
              ...slot,
              id: slotId,
              label: `${item.label} ${slot.label}`
            };
          }
        }
      }
    }

    // Fallback: créer un slot basique
    return {
      id: slotId,
      label: slotId,
      type: 'text' as const,
      prompt: `Champ ${slotId}`
    };
  };

  for (const item of sequence.sequence) {
    if (item.kind === 'title' || item.kind === 'boilerplate') {
      // Si on a déjà du contenu dans le paragraphe courant, on le sauvegarde
      if (currentParagraph.length > 0) {
        paragraphs.push({
          type: 'paragraph',
          children: [...currentParagraph],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        });
        currentParagraph = [];
      }

      // Créer un nouveau paragraphe avec le titre/boilerplate
      paragraphs.push({
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: item.text,
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            version: 1,
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      });
    } else if (item.kind === 'slot') {
      const slotInfo = findSlotInPlan(item.slotId);

      // Ajouter le slot au paragraphe courant
      currentParagraph.push({
        type: 'slot',
        slotId: item.slotId,
        slotLabel: slotInfo.label,
        slotType: slotInfo.type || 'text',
        optional: 'optional' in slotInfo ? slotInfo.optional || false : false,
        placeholder: slotInfo.prompt || `Saisissez ${slotInfo.label}`,
        version: 1,
      });
    }
  }

  // Sauvegarder le dernier paragraphe s'il y a du contenu
  if (currentParagraph.length > 0) {
    paragraphs.push({
      type: 'paragraph',
      children: [...currentParagraph],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    });
  }

  const result: LexicalAST = {
    root: {
      type: 'root',
      children: paragraphs,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    }
  };

  return result;
}


/* =========================
 * 5) CONSTRUCTION LEXICAL AST
 * ========================= */





/* =========================
 * 6) FONCTIONS PRINCIPALES
 * ========================= */


export async function generateTemplateFromPlanAndText({
  planResolved,
  sourceText,
}: {
  planResolved: PlanResolved;
  sourceText: string;
}): Promise<TemplatePayload> {

  const sequence = await generateSequenceWithLLM(sourceText, planResolved);

  const ast = buildAstFromSequence(planResolved, sequence);

  const slotsSpec: SlotSpec[] = [
    ...planResolved.slots,
    ...planResolved.repeaters.map(r => ({
      kind: 'repeat' as const,
      id: r.id,
      from: { enum: r.items },
      slots: r.slots
    }))
  ];

  return { content: ast, slotsSpec: slotsSpec, label: planResolved.label };
}

// Export des fonctions et constantes manquantes
export const DECISIONS_SCHEMA = SEQUENCE_SCHEMA;

// Contrôleur Express pour planToTemplate
export async function planToTemplateController(req: Request, res: Response) {
  try {
    const { planResolved, originalText } = req.body as { planResolved: PlanResolved; originalText: string };
    
    if (!planResolved || !originalText) {
      res.status(400).json({ error: 'Missing planResolved or originalText' });
      return;
    }

    const template = await generateTemplateFromPlanAndText({
      planResolved,
      sourceText: originalText
    });

    res.json({
      ok: true,
      template
    });
  } catch (error) {
    console.error('Error in planToTemplateController:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
