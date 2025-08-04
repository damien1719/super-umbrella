import { SingleMessage } from './promptbuilder';

export interface RefineSelectionParams {
    systemPrompt?: string;
    contextData?: string;
    refineInstruction: string;
    selectedText: string;
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
  
    msgs.push({
      role: 'system',
      content: (params.systemPrompt ?? DEFAULT_SYSTEM).trim()
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
  