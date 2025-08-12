import { SingleMessage, DEFAULT_SYSTEM } from './promptbuilder';

export function promptCommentTestResults(resultsText: string): readonly SingleMessage[] {
  const msgs: SingleMessage[] = [];
  msgs.push({ role: 'system', content: DEFAULT_SYSTEM });
  msgs.push({
    role: 'system',
    content: `INSTRUCTIONS\nRédige un commentaire détaillé, factuel et synthétique des résultats de tests fournis.`,
  });
  msgs.push({ role: 'user', content: resultsText });
  return msgs;
}
