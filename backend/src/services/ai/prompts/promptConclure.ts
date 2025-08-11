import { SingleMessage, DEFAULT_SYSTEM } from './promptbuilder';

export function promptConclure(bilanText: string): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];
  msgs.push({ role: 'system', content: DEFAULT_SYSTEM });
  msgs.push({
    role: 'system',
    content: `INSTRUCTIONS\nRédige une synthèse et une conclusion du bilan psychomoteur suivant. Utilise un ton descriptif, nuancé et factuel.`,
  });
  msgs.push({ role: 'user', content: bilanText });
  return msgs;
}
