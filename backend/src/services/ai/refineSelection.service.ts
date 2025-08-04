import { refineSelectionPrompt, type RefineSelectionParams } from './prompts/refineSelectionPrompt';
import { ChatCompletionMessageParam, ChatCompletionCreateParams } from 'openai/resources/index';
import { openaiProvider } from './providers/openai.provider';
import * as guardrails from './guardrails';

export async function refineSelection(
  params: RefineSelectionParams,
) {
  const sanitized = guardrails.pre(JSON.stringify(params));
  const messages = refineSelectionPrompt(
    JSON.parse(sanitized) as RefineSelectionParams,
  ) as unknown as ChatCompletionMessageParam[];
  const result = await openaiProvider.chat({
    messages,
  } as ChatCompletionCreateParams);
  return guardrails.post(result || '');
}
