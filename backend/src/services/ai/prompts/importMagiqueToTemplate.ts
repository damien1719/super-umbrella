// src/services/ai/prompts/importMagiqueToTemplate.ts
// === FICHIER PRINCIPAL - ORCHESTRATEUR POUR L'IMPORT MAGIQUE ===
// Maintenant séparé en 2 services distincts dans le dossier ./template/

import type { Request, Response, NextFunction } from 'express';
import {
  buildPlanController as originalBuildPlanController,
  generatePlanWithSlotsSpec,
  planToTemplateController as originalPlanToTemplateController,
  generateTemplateFromPlanAndText,
  type PlanResolved,
  type TemplatePayload,
  type LexicalAST,
  type SlotSpec,
  type RepeatSpec
} from './template/index';

// Re-export des types pour compatibilité
export type {
  PlanResolved,
  TemplatePayload,
  LexicalAST,
  SlotSpec,
  RepeatSpec
};

/* =========================
 * CONTROLLERS (Utilisent les services séparés)
 * ========================= */

// POST /api/importMagique/plan
// body: { source: string }
export async function buildPlanController(req: Request, res: Response) {
  return originalBuildPlanController(req, res);
}

// POST /api/importMagique/toTemplate
// body: { planResolved: PlanResolved, originalText: string }
export async function planToTemplateController(req: Request, res: Response, _next: NextFunction) {
  return originalPlanToTemplateController(req, res);
}

/* =========================
 * FONCTION PRINCIPALE (Orchestrateur)
 * ========================= */

// Fonction principale pour l'import magique - combine les deux étapes
export async function importMagiqueToTemplate({
  sourceText,
  planResolved,
}: { sourceText: string; planResolved?: PlanResolved }): Promise<TemplatePayload> {
  console.log('[DEBUG] importMagiqueToTemplate - Starting LLM processing');
  console.log('[DEBUG] importMagiqueToTemplate - Input text length:', sourceText.length);
  console.log('[DEBUG] importMagiqueToTemplate - Input text preview:', sourceText.substring(0, 100) + '...');
  console.log('[DEBUG] importMagiqueToTemplate - Input planResolved:', planResolved ? JSON.stringify(planResolved, null, 2) : 'null');

  try {
    // Étape 1: Disposer d'un plan avec format canonique
    let planWithSlots: { planResolved: PlanResolved; slotsSpec: SlotSpec[] };
    if (!planResolved) {
      console.log('[DEBUG] importMagiqueToTemplate - No planResolved provided, generating with canonical format...');
      planWithSlots = await generatePlanWithSlotsSpec(sourceText);
      console.log('[DEBUG] importMagiqueToTemplate - Generated plan with', planWithSlots.planResolved.slots.length, 'slots and', planWithSlots.planResolved.repeaters.length, 'repeaters');
      console.log('[DEBUG] importMagiqueToTemplate - Canonical slotsSpec:', JSON.stringify(planWithSlots.slotsSpec, null, 2));
    } else {
      console.log('[DEBUG] importMagiqueToTemplate - Using provided plan, converting to canonical format...');
      // Convertir le plan fourni vers format canonique
      const repeats: import('../../../types/template').RepeatSpec[] = planResolved.repeaters.map((r) => ({
        kind: 'repeat' as const,
        id: r.id,
        from: { enum: r.items },
        ctx: 'item',
        namePattern: r.name,
        slots: r.slots
      }));
      planWithSlots = {
        planResolved,
        slotsSpec: [...planResolved.slots, ...repeats]
      };
    }

    // Étape 2: Appel 2 → générer le template complet avec le format canonique
    console.log('[DEBUG] importMagiqueToTemplate - Building template...');
    const template = await generateTemplateFromPlanAndText({
      planResolved: planWithSlots.planResolved,
      sourceText
    });

    console.log('[DEBUG] importMagiqueToTemplate - Final result - content valid:', !!template.content);
    console.log('[DEBUG] importMagiqueToTemplate - Final result - slots count:', template.slotsSpec.length);
    console.log('[DEBUG] importMagiqueToTemplate - Final result - label:', template.label);
    console.log('[DEBUG] importMagiqueToTemplate - Final result - canonical slotsSpec:', JSON.stringify(template.slotsSpec, null, 2));

    return template;
  } catch (error) {
    console.error('[DEBUG] importMagiqueToTemplate - Error:', error);
    throw error;
  }
}