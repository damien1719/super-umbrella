/** Message OpenAI unique */
export type SingleMessage = { role: "system" | "user"; content: string };

/** Paramètres génériques pour tout type de prompt */
export interface PromptParams {
  /** Si tu veux surcharger le system prompt par défaut */
  systemPrompt?: string;
  /** Ton contexte métier (BDD, docs…) */
  contextData?: string;
  /** Les instructions spécifiques à ton cas d’usage */
  instructions: string;
  /** Les données brutes / notes / question de l’utilisateur */
  userContent: string;
}

/** Valeur par défaut pour ton system prompt */
export const DEFAULT_SYSTEM = `
Tu es une psychomotricienne diplômée d’État en France.

Ton écriture suit :
• les référentiels français de psychomotricité et les recos HAS pour le bilan ;
• un ton descriptif, empathique, nuancé, sans jargon inutile ;
• la confidentialité : jamais de nom de famille, d’adresse ou d’information stigmatisante ;
• la mise en avant des liens entre sensorimotricité, affectif et cognitif (schéma corporel, praxies, régulation tonico‑émotionnelle, etc.).
`.trim();

/**
 * Construit UN SEUL message pour l’API OpenAI,
 * en concaténant tous tes blocs dans `content`.
 */
export function buildSinglePrompt(params: PromptParams): readonly SingleMessage[] {
  // 1. Choix du system prompt
  const system = (params.systemPrompt ?? DEFAULT_SYSTEM).trim();

  // 2. Bloc contexte (optionnel)
  const ctx = params.contextData
    ? `### Contexte\n${params.contextData.trim()}`
    : "";

  // 3. Instructions spécifiques
  const instr = params.instructions.trim();

  // 4. Données utilisateur
  const user = params.userContent.trim();

  // On assemble tous les blocs, en saut de ligne entre chacun
  const content = [system, ctx, instr, user]
    .filter((blk) => blk.length > 0)
    .join("\n\n");

  // Retourne un array d’un seul message
  return [{ role: "system", content }] as const;
}
