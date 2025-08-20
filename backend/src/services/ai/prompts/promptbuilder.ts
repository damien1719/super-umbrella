/** Message OpenAI unique */
export type SingleMessage = { role: 'system' | 'user' | 'assistant'; content: string };

/** Paramètres génériques pour tout type de prompt */
export interface PromptParams {
  /** Si tu veux surcharger le system prompt par défaut */
  systemPrompt?: string;
  /** Ton contexte métier (BDD, docs…) */
  contextData?: string;
  /** Les instructions spécifiques à ton cas d'usage */
  instructions: string;
  /** Les données brutes / notes / question de l'utilisateur */
  userContent: string;
  /** Exemples de textes pour guider la génération */
  examples?: string[];
  /** Un guide de style compact (extrait des exemples) */
  stylePrompt?: string;
  /** Notes brutes importées */
  rawNotes?: string;
}

/** Valeur par défaut pour ton system prompt */
export const DEFAULT_SYSTEM = `
Tu es une psychomotricienne diplômée d'État en France.

Ton écriture suit :
• les référentiels français de psychomotricité et les recos HAS pour le bilan ;
• un ton descriptif, empathique, nuancé, sans jargon inutile ;
• la confidentialité : jamais de nom de famille, d'adresse ou d'information stigmatisante ;
• la mise en avant des liens entre sensorimotricité, affectif et cognitif (schéma corporel, praxies, régulation tonico‑émotionnelle, etc.).
`.trim();

export const SYSTEM_ERGO = `
Vous êtes un(e) ergothérapeute expérimenté(e) travaillant en France, spécialisé(e) dans l’évaluation et la rééducation de la motricité fine, de la coordination, de l’autonomie dans les activités de la vie quotidienne et de l’adaptation de l’environnement.
Votre rôle est de produire des contenus cliniquement pertinents, précis, structurés et rédigés dans un style clair, professionnel et compréhensible par d’autres professionnels de santé.
Les réponses doivent s’appuyer sur les recommandations de bonnes pratiques françaises (HAS, ANFE) et éviter toute interprétation non justifiée par des données observables ou standardisées.
Format attendu : structuré, concis, orienté vers l’action (évaluations, observations, recommandations).
`.trim();

export const SYSTEM_NEUROPSY = `
Vous êtes un(e) neuropsychologue expérimenté(e) en France, spécialisé(e) dans l’évaluation et l’analyse des fonctions cognitives (mémoire, attention, fonctions exécutives, langage, praxies, gnosies) et leur impact sur la vie quotidienne.
Votre rôle est de fournir des contenus cliniquement précis, scientifiquement étayés, structurés et rédigés dans un style clair, professionnel et compréhensible par d’autres professionnels de santé.
Les réponses doivent être conformes aux recommandations de bonnes pratiques françaises (HAS, SNLF) et se baser uniquement sur des observations ou résultats d’outils validés.
Format attendu : structuré, avec distinction claire entre données objectives, analyses et conclusions cliniques.
`.trim();

/**
 * Construit les messages pour l'API OpenAI en structurant le prompt en plusieurs parties
 */
export function buildPrompt(params: PromptParams & { job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' }): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];

  // 1. System prompt global
  const byJob = params.job === 'ERGOTHERAPEUTE' ? SYSTEM_ERGO
    : params.job === 'NEUROPSYCHOLOGUE' ? SYSTEM_NEUROPSY
    : DEFAULT_SYSTEM;
  msgs.push({ role: 'system', content: (params.systemPrompt ?? byJob).trim() });

  // 2. Format de sortie pour limiter les hallucinations
  msgs.push({ role: 'system', content: 
    `FORMAT DE SORTIE
      1. Pour chaque titre de section markdown repéré dans les données du patient, tu dois reproduire exactement ce même titre markdown dans ta réponse.   
      2. Pour chaque tableau ou bloc de données, rédige des phrases descriptives et factuelles.`  
    .trim()
  });

  // 3. Contexte métier (optionnel)
  if (params.contextData) {
    msgs.push({ role: 'user', content: `Contexte (Markdown)\n${params.contextData.trim()}` });
  }

  // 4. Instructions spécifiques
  msgs.push({ role: 'system', content: `INSTRUCTIONS\n${params.instructions.trim()}` });

  // 4bis. Guide de style compact
  if (params.stylePrompt && params.stylePrompt.trim().length > 0) {
    msgs.push({ role: 'system', content: `GUIDE DE STYLE\n${params.stylePrompt.trim()}` });
  }

  
   // 5. démonstration de style (exemples de réponses)
   if (params.examples && params.examples.length > 0) {
    msgs.push({ role: 'system', content: `EXEMPLES (few-shot) pour d'autres patients` });
    // on ne précise pas d'"userContent" : c'est juste une réponse à prendre comme modèle
    params.examples.slice(0, 3).forEach(example => {
      msgs.push({ role: 'assistant', content: example.trim() });
    });
  }

  // 6. Données utilisateur
  msgs.push({ role: 'user', content: `Données du patient actuel (Markdown):\n${params.userContent.trim()}` });

  if (params.rawNotes && params.rawNotes.trim().length > 0) {
    msgs.push({
      role: 'user',
      content: `Notes brutes importées:\n${params.rawNotes.trim()}`,
    });
  }


  return msgs ;
}

// Alias pour la rétrocompatibilité
export const buildSinglePrompt = buildPrompt;
