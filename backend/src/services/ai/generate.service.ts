
import { openaiProvider } from "./providers/openai.provider";
import { buildSinglePrompt, type PromptParams } from "./prompts/promptbuilder";
import { ChatCompletionMessageParam, ChatCompletionCreateParams } from "openai/resources/index";
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
      { messages } as ChatCompletionCreateParams,
      chunk => process.stdout.write(chunk) // ici on renvoie vers stdout, à toi de brancher SSE/WS
    );
  }

  const result = await openaiProvider.chat({ messages } as ChatCompletionCreateParams);
  // 4. Post-traitement
  return guardrails.post(result || "");
}

// Transform text into structured JSON using transformPrompt
import { generateStructuredJSON, type TransformPromptParams } from "./prompts/transformPrompt";
import {
  generateTableFromImage,
  type TransformImageToTableParams,
} from "./prompts/transformImageToTable";
import {
  generateTableFromText,
  type TransformTextToTableParams,
} from "./prompts/transformTextToTable";

export async function transformText(params: TransformPromptParams) {
  // 1. RGPD pre-processing similar to generateText
  const sanitized = guardrails.pre(JSON.stringify(params));

  // 2. Call the dedicated structured JSON generator
  const structured = await generateStructuredJSON(
    JSON.parse(sanitized) as TransformPromptParams,
  );

  // 3. Post-processing (still run through guardrails for consistency)
  return guardrails.post(structured);
}

export async function transformImageToTable(
  params: TransformImageToTableParams,
): Promise<{ colonnes: string[]; lignes: string[] }> {
  const sanitized = guardrails.pre(JSON.stringify(params));
  const structured = await generateTableFromImage(
    JSON.parse(sanitized) as TransformImageToTableParams,
  );
  return guardrails.post(structured) as { colonnes: string[]; lignes: string[] };
}

export async function transformTextToTable(
  params: TransformTextToTableParams,
): Promise<{ colonnes: string[]; lignes: string[] }> {
  const sanitized = guardrails.pre(JSON.stringify(params));
  const structured = await generateTableFromText(
    JSON.parse(sanitized) as TransformTextToTableParams,
  );
  return guardrails.post(structured) as { colonnes: string[]; lignes: string[] };
}
