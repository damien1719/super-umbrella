import type { SingleMessage } from './promptbuilder';
import { openaiProvider } from '../providers/openai.provider';

export interface ExtractStyleParams {
  texts: string[]; // 1..n exemples de texte
}

export function buildExtractStylePrompt(params: ExtractStyleParams): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];
  msgs.push({
    role: 'system',
    content:
      'Tu es un assistant expert en analyse stylistique de textes cliniques français. Ton rôle est d’extraire un guide de style concis et actionnable à partir des extraits fournis.',
  });
  msgs.push({
    role: 'user',
    content: [
      'À partir des extraits suivants, produis un "stylePrompt" concis, structuré et autoportant contenant:',
      '- Ton employé (impersonnel / nous / je).',
      '- Longueur de phrase cible (médiane et écart).',
      '- Ponctuation & connecteurs typiques (ex: « au regard de », « on note que », « dans ce contexte »).',
      '- Niveau de modalisation (ex: prudent: « suggère », « semble »).',
      '- Préférences de liste (puces vs paragraphes).',
      '- Abréviations, unités, conventions (ex: NE, RP, DS; 0,5 vs 0.5; %).',
      '- Formules récurrentes et anti-formules (à éviter).',
      '- 2–3 bouts de phrase typiques (fragments utiles).',
      '',
      'Contraintes:',
      '- Sois synthétique (<= 250 mots).',
      '- N’inclue AUCUNE donnée du patient: uniquement des consignes de style.',
      '- Format: un texte clair (pas de JSON).',
    ].join('\n'),
  });
  const joined = params.texts.map((t, i) => `### EXEMPLE ${i + 1}\n${t}`).join('\n\n');
  msgs.push({ role: 'user', content: joined });
  return msgs;
}

export async function extractStyle(params: ExtractStyleParams): Promise<string> {
  const messages = buildExtractStylePrompt(params) as any;
  const res = await openaiProvider.chat({ messages } as any);
  return (res || '').toString();
}


