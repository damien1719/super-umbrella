export const promptConfigs = {
    anamnese: {
      title: "Anamnèse",
      instructions: `
  ### BLOC INSTRUCTIONS – ANAMNÈSE
  1. Rédige la section « Anamnèse » d’un bilan psychomoteur.
  2. Adopte des phrases factuelles et descriptives.
  3. Très important : ne formuler aucun commentaire ni interprétation ; l’objectif est de rester strictement factuel et descriptif des informations rapportées par les parents.
  4. Très important : n'invente rien et n'oublie rien ce sont des données factuelles clés sur une personne
  5. Lorsque précisée cite la source de l'information.
  `.trim(),
    },
    profil_sensoriel: {
      title: "Profil sensoriel",
      instructions: `
  ### BLOC INSTRUCTIONS – PROFIL SENSORIEL
  1. Décris le profil sensoriel du patient (hypo/hypersensibilités, seuils, modulabilité).
  2. Appuie-toi sur les observations cliniques et retours familiaux.
  3. Relie les réactions sensorielles à la régulation tonico-émotionnelle.
  4. Évite les termes techniques sans explication.
      `.trim(),
    },
    observations: {
      title: "Observations",
      instructions: `
  ### BLOC INSTRUCTIONS – OBSERVATIONS
  1. Présente les observations motrices et posturales (schéma corporel, praxies).
  2. Décris le contexte de l’observation (activité, environnement).
  3. Note les points forts et les difficultés.
  4. Utilise un ton descriptif, nuancé et factuel.
      `.trim(),
    },
    tests_standards: {
      title: "Tests standards",
      instructions: `
  ### BLOC INSTRUCTIONS – TEST‑STANDARDS
  1. Vérifie la conformité de chaque critère par rapport aux standards HAS et référentiels français.
  2. Présente un tableau synthétique des points validés et non-validés.
  3. Fournis pour chaque non-conformité une recommandation corrective précise.
  4. Cite la source réglementaire ou bibliographique pour chaque point (HAS, textes officiels, articles).
      `.trim(),
    },
    conclusions: {
      title: "Conclusions",
      instructions: `
  ### BLOC INSTRUCTIONS – CONCLUSIONS
  1. Présente les conclusions du bilan psychomoteur.
  2. Utilise un ton descriptif, nuancé et factuel.
      `.trim(),
    },
    transformationImport: {
      title: "Transformation Import",
      instructions: `Le psychomotricien t'a copier coller un exemple de trame Word qu'il utilise. Ton objectif est de proposer une structure en liste de questions pour lui permettre de le remplir efficacement. Ce qui compte c'est la structure. Il peut y avoir beaucoup de commentaires sur les instructions pour des exercices à faire qui ne sont pas forcément pertinentes`.trim(),
    },
  } as const;
  