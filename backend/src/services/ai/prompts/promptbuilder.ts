/** Message OpenAI unique */
export type SingleMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>
};

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
  /** Override du modèle OpenAI par défaut */
  model?: string;
  /** Image importée en base64 (optionnel) */
  imageBase64?: string;
  /** Bloc de formatage de sortie spécifique (override) */
  outputFormat?: string;
}

/** Valeur par défaut pour ton system prompt */
export const DEFAULT_SYSTEM = `
Tu rédiges un bilan pour une psychomotricienne sur la base de ses notes brutes. Tu appelles le patient par son prénom. Tu ne donnes pas d'informations stigmatisantes. Tu écris des phrases SIMPLES compréhensibles pour tous.
`.trim();

export const SYSTEM_ERGO = `
Tu rédiges un bilan pour une ergothérapeute sur la base de ses notes brutes. Tu appelles le patient par son prénom. Tu ne donnes pas d'informations stigmatisantes. Tu écris des phrases SIMPLES compréhensibles pour tous.
`.trim();

export const SYSTEM_NEUROPSY = `
Tu rédiges un bilan pour une neuropsychologue sur la base de ses notes brutes. Tu appelles le patient par son prénom. Tu ne donnes pas d'informations stigmatisantes. Tu écris des phrases SIMPLES compréhensibles pour tous.
`.trim();

/** Résultat de buildPrompt avec les messages et le modèle */
export type PromptResult = {
  messages: readonly SingleMessage[];
  model?: string;
};

/**
 * Bloc de formatage par défaut (utilisé si aucun outputFormat n'est fourni).
 * Garde un cadre générique pour les générations "texte".
 */
export const DEFAULT_OUTPUT_FORMAT = `
###FORMAT DE SORTIE
1. Pour chaque titre de section markdown repéré dans les données du patient, tu dois reproduire exactement ce même titre markdown dans ta réponse.
2. Pour chaque tableau ou bloc de données, rédige des phrases descriptives et factuelles sans bullet points ni listes.
`.trim();

/**
 * Construit les messages pour l'API OpenAI en structurant le prompt en plusieurs parties
 */
export function buildPrompt(params: PromptParams & { job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' }): PromptResult {
  const msgs: SingleMessage[] = [];

  // 1. System prompt global
  const byJob = params.job === 'ERGOTHERAPEUTE' ? SYSTEM_ERGO
    : params.job === 'NEUROPSYCHOLOGUE' ? SYSTEM_NEUROPSY
    : DEFAULT_SYSTEM;
  msgs.push({ role: 'system', content: (params.systemPrompt ?? byJob).trim() });

  // 2. Format de sortie pour limiter les hallucinations (surcharge possible)
  msgs.push({ role: 'system', content: (params.outputFormat ?? DEFAULT_OUTPUT_FORMAT).trim() });

  // 3. Contexte métier (optionnel)
  if (params.contextData) {
    msgs.push({ role: 'user', content: params.contextData.trim() });
  }

  // 4. Instructions spécifiques
  msgs.push({ role: 'system', content: params.instructions.trim() });

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

  console.log('[DEBUG] buildPrompt - imageBase64:', params.imageBase64);

  // 6. Données utilisateur
  if (params.imageBase64) {
    // Si on a une image, on utilise un message multimodal
    const content = [
      {
        type: 'image_url' as const,
        image_url: {
          url: `data:image/png;base64,${params.imageBase64}`,
        },
      },
      {
        type: 'text' as const,
        text: params.userContent.trim(),
      },
    ];

    if (params.rawNotes && params.rawNotes.trim().length > 0) {
      content.push({
        type: 'text' as const,
        text: `Notes brutes importées:\n${params.rawNotes.trim()}`,
      });
    }

    msgs.push({ role: 'user', content });
  } else {
    // Message texte classique
    msgs.push({ role: 'user', content: params.userContent.trim() });

    if (params.rawNotes && params.rawNotes.trim().length > 0) {
      msgs.push({
        role: 'user',
        content: `Notes brutes importées:\n${params.rawNotes.trim()}`,
      });
    }
  }


  return { messages: msgs, model: params.model };
}

// Alias pour la rétrocompatibilité
export const buildSinglePrompt = buildPrompt;

