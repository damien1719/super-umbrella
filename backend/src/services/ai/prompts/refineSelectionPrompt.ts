import { SingleMessage } from './promptbuilder';

export interface RefineSelectionParams {
  systemPrompt?: string;
  contextData?: string;
  refineInstruction: string;
  selectedText: string;
  job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE';
}
  

  // A voir si dans le contexte j'ajoute aussi plus largement des infos sur l'éditeur ? Mais bon ça risque peut être de brouiller un peu le truc
  
  export const DEFAULT_SYSTEM = `
  Tu es une psychomotricienne diplômée d'État en France.
  
  Ton écriture suit :
  • les référentiels français de psychomotricité et les recos HAS pour le bilan ;
  • un ton descriptif, empathique, nuancé, sans jargon inutile ;
  • la confidentialité : jamais de nom de famille, d'adresse ou d'information stigmatisante ;
  • la mise en avant des liens entre sensorimotricité, affectif et cognitif (schéma corporel, praxies, régulation tonico-émotionnelle, etc.).
  `.trim();
  
  export function refineSelectionPrompt(params: RefineSelectionParams): readonly SingleMessage[] {
    const msgs: SingleMessage[] = [];
  
    // Choix du system prompt selon job si non surchargé
    const SYSTEM_ERGO = `
Vous êtes un(e) ergothérapeute expérimenté(e) travaillant en France, spécialisé(e) dans l’évaluation et la rééducation de la motricité fine, de la coordination, de l’autonomie dans les activités de la vie quotidienne et de l’adaptation de l’environnement.
Votre rôle est de produire des contenus cliniquement pertinents, précis, structurés et rédigés dans un style clair, professionnel et compréhensible par d’autres professionnels de santé.
Les réponses doivent s’appuyer sur les recommandations de bonnes pratiques françaises (HAS, ANFE) et éviter toute interprétation non justifiée par des données observables ou standardisées.
Format attendu : structuré, concis, orienté vers l’action (évaluations, observations, recommandations).
`.trim();

    const SYSTEM_NEUROPSY = `
Vous êtes un(e) neuropsychologue expérimenté(e) en France, spécialisé(e) dans l’évaluation et l’analyse des fonctions cognitives (mémoire, attention, fonctions exécutives, langage, praxies, gnosies) et leur impact sur la vie quotidienne.
Votre rôle est de fournir des contenus cliniquement précis, scientifiquement étayés, structurés et rédigés dans un style clair, professionnel et compréhensible par d’autres professionnels de santé.
Les réponses doivent être conformes aux recommandations de bonnes pratiques françaises (HAS, SNLF) et se baser uniquement sur des observations ou résultats d’outils validés.
Format attendu : structuré, avec distinction claire entre données objectives, analyses et conclusions cliniques.
`.trim();

    const byJob = params.job === 'ERGOTHERAPEUTE' ? SYSTEM_ERGO
      : params.job === 'NEUROPSYCHOLOGUE' ? SYSTEM_NEUROPSY
      : DEFAULT_SYSTEM;

    msgs.push({
      role: 'system',
      content: (params.systemPrompt ?? byJob).trim()
    });
    
    if (params.contextData) {
      msgs.push({
        role: 'user',
        content: `### Contexte\n${params.contextData.trim()}`
      });
    }

    msgs.push({
      role: 'user',
      content: `### Instructions\n${params.refineInstruction.trim()}`
    });
  
    msgs.push({
      role: 'user',
      content: `### Sélection de l'utilisateur\n${params.selectedText.trim()}`
    });
  
    return msgs;
  }
  