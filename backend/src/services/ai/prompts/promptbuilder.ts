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

/**
 * Construit les messages pour l'API OpenAI en structurant le prompt en plusieurs parties
 */
export function buildPrompt(params: PromptParams): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];

  // 1. System prompt global
  msgs.push({ role: 'system', content: (params.systemPrompt ?? DEFAULT_SYSTEM).trim() });

  // 2. Format de sortie pour limiter les hallucinations
  msgs.push({ role: 'user', content: 
    `### Format de sortie
      1. Pour chaque section "Titre de partie" du JSON, utiliser un titre de niveau "###" avec le nom exact de la clé hormis Titre de la partie.  
      2. Rédiger des phrases descriptives et factuelles pour les champs.`  
    .trim()
  });

  // 3. Contexte métier (optionnel)
  if (params.contextData) {
    msgs.push({ role: 'user', content: `### Contexte\n${params.contextData.trim()}` });
  }

  // 4. Instructions spécifiques
  msgs.push({ role: 'user', content: `### Instructions\n${params.instructions.trim()}` });

  
   // 5. démonstration de style (exemples de réponses)
   if (params.examples && params.examples.length > 0) {
    msgs.push({ role: 'user', content: `### Exemples de bilan précédemment rédigés pour d'autres patients` });
    // on ne précise pas d'"userContent" : c'est juste une réponse à prendre comme modèle
    params.examples.slice(0, 3).forEach(example => {
      msgs.push({ role: 'assistant', content: example.trim() });
    });
  }

  // 6. Données utilisateur
  msgs.push({ role: 'user', content: `### Données du patient actuel\n${params.userContent.trim()}` });


  return msgs ;
}

// Alias pour la rétrocompatibilité
export const buildSinglePrompt = buildPrompt;
