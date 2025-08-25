// src/services/ai/prompts/template/index.ts
// === POINT D'ENTRÉE POUR LES SERVICES D'IMPORT MAGIQUE ===

// Export des types du service plan
export type {
    PlanResolved,
    SlotSpec,
    RepeatSpec
  } from './plan.service';
  
  // Export des types du service decisions
  export type {
    TemplatePayload,
    LexicalAST,
    SlotInstance,
    Decision,
    DecisionsPayload
  } from './decisions.service';
  
  // Export des services Appel 1 (Plan)
  export {
    buildPlanController,
    generatePlanFromText,
    generatePlanWithSlotsSpec,
    PLAN_SCHEMA
  } from './plan.service';
  
  // Export des services Appel 2 (Décisions + AST)
  export {
    planToTemplateController,
    generateTemplateFromPlanAndText,
    DECISIONS_SCHEMA,
    SEQUENCE_SCHEMA
  } from './decisions.service';
  