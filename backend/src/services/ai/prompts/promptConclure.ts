import { SingleMessage, DEFAULT_SYSTEM, SYSTEM_ERGO, SYSTEM_NEUROPSY } from './promptbuilder';

export type SupportedJob = 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE';

export function promptConclure(
  bilanText: string,
  job?: SupportedJob,
): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];
  const byJob = job === 'ERGOTHERAPEUTE' ? SYSTEM_ERGO
    : job === 'NEUROPSYCHOLOGUE' ? SYSTEM_NEUROPSY
    : DEFAULT_SYSTEM;

  msgs.push({ role: 'system', content: byJob });
  msgs.push({
    role: 'system',
    content: `INSTRUCTIONS\nRédige une conclusion synthétique et professionnelle du bilan à partir du contenu fourni.\n•N'INVENTE RIEN\n• Ecris des phrases simples\n• Reprend les principaux éléments du bilan.\n• Ne réécris pas l'intégralité du contenu : propose une synthèse claire et opérationnelle.`,
  });
  msgs.push({ role: 'user', content: bilanText });
  return msgs;
}
