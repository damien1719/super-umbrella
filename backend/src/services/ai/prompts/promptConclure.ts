import { SingleMessage, DEFAULT_SYSTEM } from './promptbuilder';

export function promptConclure(bilanText: string): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];
  msgs.push({ role: 'system', content: DEFAULT_SYSTEM });
  msgs.push({
    role: 'system',
    content: `INSTRUCTIONS\nRédige une conclusion du bilan suivant. Conclusion courte et concise.
Adopte un ton descriptif, nuancé et factuel, en t’appuyant uniquement sur les éléments observés dans le bilan. 
La rédaction doit rester professionnelle, claire et adaptée au contexte métier de l’évaluateur.`,
  });
  msgs.push({ role: 'user', content: bilanText });
  return msgs;
}
