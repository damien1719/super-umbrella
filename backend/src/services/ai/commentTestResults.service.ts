import { ChatCompletionCreateParams, ChatCompletionMessageParam } from 'openai/resources/index';
import { openaiProvider } from './providers/openai.provider';
import * as guardrails from './guardrails';
import { promptCommentTestResults } from './prompts/promptCommentTestResults';

export async function commentTestResults(fileContent: string) {
  const sanitized = guardrails.pre(fileContent);
  const messages = promptCommentTestResults(sanitized) as unknown as ChatCompletionMessageParam[];
  const result = await openaiProvider.chat({ messages } as ChatCompletionCreateParams);
  return guardrails.post(result || '');
}
