export const promptConfigs = {
    anamnese: {
      title: "Anamnèse",
      instructions: `
INSTRUCTIONS ANAMNÈSE
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
INSTRUCTIONS PROFIL SENSORIEL
Réalise un profil sensoriel sur la base des données fournies par la famille

      `.trim(),
    },
    observations: {
      title: "Observations",
      instructions: `
INSTRUCTIONS OBSERVATIONS
  1. Présente les observations motrices et posturales (schéma corporel, praxies).
  2. Décris le contexte de l’observation (activité, environnement).
  3. Note les points forts et les difficultés.
  4. Utilise un ton descriptif, nuancé et factuel.
      `.trim(),
    },
    tests_standards: {
      title: "Tests standards",
      instructions: `
INSTRUCTIONS TEST‑STANDARDS
Ton objectif est de réaliser un bilan sensoriel sur la base de tests de résultats
1. Transformation des scores  
   • Pour chaque item de test (M-ABC-2, NPMOT…), transforme le score brut et le percentile en phrase descriptive courte :  
     – « Sur la sous-épreuve Équilibre du M-ABC-2, score brut 6/10 (15ᵉ percentile) → performance légèrement en dessous de la moyenne. »  
   • Ne génère aucune interprétation ni explication normative ; reste factuel.
2. Identification des non-conformités  
   • Repère tout score en dessous du seuil clinique (ex. percentile < 5 ou score critique) et mentionne-le explicitement :  
     – « Score critique en motricité fine (percentile 3) : attention à la coordination oculo-manuelle. »  
   • Cite la source normative (MANUEL M-ABC-2, HAS, échelle NPMOT) entre crochets.
3. Synthèse des écarts  
   • Regroupe en 2 – 3 phrases les domaines présentant des difficultés significatives :  
     – thématiques (équilibre, coordination, planification motrice…)  
     – conséquences possibles sur la participation aux activités quotidiennes.
4. Recommandations ciblées  
   • Propose **2 – 3 mesures correctives** précises pour chaque domaine en difficulté :  
     – exercices gradués (ex. parcours d’équilibre progressif),  
     – adaptations environnementales (ex. support visuel, table antidérapante),  
     – conseils à l’entourage (ex. fractionner la tâche).  
   • Associe chaque recommandation à sa justification issue des résultats.
  
      `.trim(),
    },
    conclusions: {
      title: "Conclusions",
      instructions: `
INSTRUCTIONS CONCLUSIONS
  1. Présente les conclusions du bilan psychomoteur.
  2. Utilise un ton descriptif, nuancé et factuel.
      `.trim(),
    },
    transformationImport: {
      title: "Transformation Import",
      instructions: `Le psychomotricien t'a copier coller un exemple de trame Word qu'il utilise. Ton objectif est de proposer une structure en liste de questions pour lui permettre de le remplir efficacement. Ce qui compte c'est la structure. Il peut y avoir beaucoup de commentaires sur les instructions pour des exercices à faire qui ne sont pas forcément pertinentes`.trim(),
    },
  } as const;
  