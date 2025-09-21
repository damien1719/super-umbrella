/**
 * Format de sortie spécifique à la génération par placeholders (gen-part).
 * Objectifs:
 * - Production en paragraphes (pas de listes/bullets, pas de tableaux ASCII/Markdown).
 * - Pas de titres Markdown supplémentaires: la structure est gérée par le template.
 * - Respect strict des ancres de tableaux si elles sont listées dans les instructions.
 */
export const GENPART_OUTPUT_FORMAT = `
`.trim();

export default GENPART_OUTPUT_FORMAT;

