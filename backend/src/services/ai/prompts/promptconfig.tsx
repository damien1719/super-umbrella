export const promptConfigs = {
    anamnesis: {
      title: "anamnèse",
      instructions: `
  ### BLOC INSTRUCTIONS – ANAMNÈSE
  1. Rédige la section « Anamnèse » d’un bilan psychomoteur.
  2. Organise le texte de manière claire et professionnelle ; intertitres ou paragraphes continus.
  3. Situe chaque info (périnatal, développement, familial, santé, intérêts, événements marquants).
  4. Cite la source pour tout propos rapporté (“selon la mère”, “d’après l’enseignante”).
      `.trim(),
    },
    sensoryProfile: {
      title: "profil_sensoriel",
      instructions: `
  ### BLOC INSTRUCTIONS – PROFIL SENSORIEL
  1. Décris le profil sensoriel du patient (hypo/hypersensibilités, seuils, modulabilité).
  2. Appuie-toi sur les observations cliniques et retours familiaux.
  3. Relie les réactions sensorielles à la régulation tonico-émotionnelle.
  4. Évite les termes techniques sans explication.
      `.trim(),
    },
    observations: {
      title: "observations",
      instructions: `
  ### BLOC INSTRUCTIONS – OBSERVATIONS
  1. Présente les observations motrices et posturales (schéma corporel, praxies).
  2. Décris le contexte de l’observation (activité, environnement).
  3. Note les points forts et les difficultés.
  4. Utilise un ton descriptif, nuancé et factuel.
      `.trim(),
    },
    testStandards: {
      title: "test_standards",
      instructions: `
  ### BLOC INSTRUCTIONS – TEST‑STANDARDS
  1. Vérifie la conformité de chaque critère par rapport aux standards HAS et référentiels français.
  2. Présente un tableau synthétique des points validés et non-validés.
  3. Fournis pour chaque non-conformité une recommandation corrective précise.
  4. Cite la source réglementaire ou bibliographique pour chaque point (HAS, textes officiels, articles).
      `.trim(),
    },
  } as const;
  