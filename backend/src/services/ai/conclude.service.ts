import { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources/index';
import { openaiProvider } from './providers/openai.provider';
import * as guardrails from './guardrails';
import { promptConclure, type SupportedJob } from './prompts/promptConclure';

export async function concludeBilan(text: string, job?: SupportedJob) {
  const sanitized = guardrails.pre(text);
  const messages = promptConclure(sanitized, job) as unknown as ChatCompletionMessageParam[];
  const result = await openaiProvider.chat({ messages } as ChatCompletionCreateParams);
  return guardrails.post(result || '');
}
