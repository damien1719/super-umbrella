import { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources/index';
import { openaiProvider } from './providers/openai.provider';
import * as guardrails from './guardrails';
import { promptConclure } from './prompts/promptConclure';

export async function concludeBilan(text: string) {
  const sanitized = guardrails.pre(text);
  const messages = promptConclure(sanitized) as unknown as ChatCompletionMessageParam[];
  const result = await openaiProvider.chat({ messages } as ChatCompletionCreateParams);
  return guardrails.post(result || '');
}
