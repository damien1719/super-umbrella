
import { openaiProvider } from "./openai.provider";
import { buildDummyPrompt, DummyInput } from "./prompts/promptbuilder";
import * as guardrails from "./guardrails";

export async function generateDummy(
  data: DummyInput,
  { stream = false } = {}
) {
  // 1. Pré-traitement RGPD
  const sanitized = guardrails.pre(JSON.stringify(data));

  // 2. Prompt
  const messages = buildDummyPrompt(JSON.parse(sanitized));

  // 3. Appel modèle (avec ou sans streaming)
  if (stream) {
    return openaiProvider.chat(
      { messages },
      chunk => process.stdout.write(chunk) // ici on renvoie vers stdout, à toi de brancher SSE/WS
    );
  }

  const result = await openaiProvider.chat({ messages });
  // 4. Post-traitement
  return guardrails.post(result);
}
