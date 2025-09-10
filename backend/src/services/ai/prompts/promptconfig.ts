export const promptConfigs = {
    anamnese: {
      title: "Anamnèse",
      instructions: `
###INSTRUCTIONS ANAMNÈSE
  1. Rédige la section « Anamnèse » d’un bilan psychomoteur.
  2. Adopte des phrases factuelles et descriptives.
  3. Très important : ne formuler aucun commentaire ni interprétation ; l’objectif est de rester strictement factuel et descriptif des informations rapportées par les parents.
  4. Très important : n'invente rien et n'oublie rien ce sont des données factuelles clés sur une personne
  `.trim(),
    },
    profil_sensoriel: {
      title: "Profil sensoriel",
      instructions: `
###INSTRUCTIONS PROFIL SENSORIEL
Réalise un profil sensoriel sur la base des données fournies par la famille

      `.trim(),
    },
    observations: {
      title: "Observations",
      instructions: `
###INSTRUCTIONS OBSERVATIONS
À partir des données fournies dans le Contexte : 
- Reformule chaque résultat ou observation en phrases complètes, factuelles et descriptives. 
- Restitue toutes les informations présentes, sans rien inventer ni omettre. 
- N’utilise jamais de listes, ni de puces, ni de style télégraphique. 
- Conserve un ton professionnel, descriptif et neutre. 
      `.trim(),
    },
    tests_standards: {
      title: "Tests standards",
      instructions: `
###INSTRUCTIONS TESTS STANDARDS
À partir des données fournies dans le Contexte : 
- Reformule chaque résultat ou observation en phrases complètes, factuelles et descriptives. 
- Restitue toutes les informations présentes, sans rien inventer ni omettre. 
- N’utilise jamais de listes, ni de puces, ni de style télégraphique. 
- Conserve un ton professionnel, descriptif et neutre. 
      `.trim(),
    },
    conclusions: {
      title: "Conclusions",
      instructions: `
###INSTRUCTIONS CONCLUSIONS
  1. Présente les conclusions du bilan psychomoteur.
  2. Utilise un ton descriptif, nuancé et factuel.
      `.trim(),
    },
    transformationImport: {
      title: "Transformation Import",
      instructions: `Le psychomotricien t'a copier coller un exemple de trame Word qu'il utilise. Ton objectif est de proposer une structure en liste de questions pour lui permettre de le remplir efficacement. Ce qui compte c'est la structure. Il peut y avoir beaucoup de commentaires sur les instructions pour des exercices à faire qui ne sont pas forcément pertinentes`.trim(),
    },
  } as const;
  