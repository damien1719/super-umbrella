/**
 * Prompts spécifiques aux génération par placeholders (gen-part).
 * Ces catégories sont découplées des prompts "section" génériques afin d'ajuster
 * le ton et les consignes aux fragments générés dans un template.
 */
export const genPartPromptConfigs = {
  // Fallback générique
  default: {
    title: 'Fragment (générique)',
    instructions: `
### INSTRUCTIONS (GEN-PART — GÉNÉRIQUE)
À partir des données fournies (sélection de réponses de questions), rédige un ou plusieurs paragraphes cohérents, factuels et descriptifs.
- N'invente pas d'informations.
- Réutilise les données disponibles quand elles sont pertinentes (chiffres, unités, items), en les reformulant en phrases.
- Pas de listes ni de puces; pas de tableaux; uniquement du texte.
`.trim(),
  } as const,

  anamnese: {
    title: 'Anamnèse (fragment)',
    instructions: `
### INSTRUCTIONS ANAMNÈSE (GEN-PART)
Rédige un paragraphe d'anamnèse synthétique et factuel à partir des réponses fournies.
- Pas de jugements ni d'interprétations.
- Mentionne les éléments temporels/chronologiques s'ils sont présents.
- Pas de listes; uniquement du texte en paragraphes.
`.trim(),
  } as const,

  profil_sensoriel: {
    title: 'Profil sensoriel (fragment)',
    instructions: `
### INSTRUCTIONS PROFIL SENSORIEL (GEN-PART)
Décris de manière structurée et neutre les informations sensorielles pertinentes.
- Reformule les éléments clés en phrases; pas de listes.
- Conserve les données chiffrées/échelles si présentes.
`.trim(),
  } as const,

  observations: {
    title: 'Observations (fragment)',
    instructions: `
### INSTRUCTIONS OBSERVATIONS (GEN-PART)
À partir des notes brutes, rédige un texte descriptif et factuel.
- Aucun bullet point, aucune liste; phrases complètes.
- N'invente rien; restitue sans omission les informations présentes et utiles.
- Écris les résultats chiffrés en chiffres.
`.trim(),
  } as const,

  tests_standards: {
    title: 'Tests standards (fragment)',
    instructions: `
### INSTRUCTIONS TESTS STANDARDS (GEN-PART)
À partir des résultats, rédige des phrases factuelles (sans interprétation) reprenant les scores/indices si présents.
- Pas de listes; uniquement du texte.
- Écris les résultats chiffrés en chiffres.
`.trim(),
  } as const,

  conclusions: {
    title: 'Conclusions (fragment)',
    instructions: `
### INSTRUCTIONS CONCLUSIONS (GEN-PART)
Rédige des conclusions descriptives et nuancées, adaptées à un fragment de section.
- Évite les recommandations; reste factuel.
`.trim(),
  } as const,
} as const;

export type GenPartPromptKey = keyof typeof genPartPromptConfigs;

export type GenPartPromptConfig = (typeof genPartPromptConfigs)[GenPartPromptKey] & {
  outputFormat?: string;
};
