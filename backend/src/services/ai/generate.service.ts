
import { openaiProvider } from "./providers/openai.provider";
import { buildSinglePrompt, type PromptParams } from "./prompts/promptbuilder";
import { ChatCompletionMessageParam } from "openai/resources/index";
import * as guardrails from "./guardrails";

export async function generateText(
  params: PromptParams,
  { stream = false } = {}
) {
  // 1. Pré-traitement RGPD
  const sanitized = guardrails.pre(JSON.stringify(params));

  // 2. Prompt
  const messages = buildSinglePrompt(
    JSON.parse(sanitized),
  ) as unknown as ChatCompletionMessageParam[];

  // 3. Appel modèle (avec ou sans streaming)
  if (stream) {
    return openaiProvider.chat(
      { messages } as any,
      chunk => process.stdout.write(chunk) // ici on renvoie vers stdout, à toi de brancher SSE/WS
    );
  }

  const result = await openaiProvider.chat({ messages } as any);
  // 4. Post-traitement
  return guardrails.post(result);
}
