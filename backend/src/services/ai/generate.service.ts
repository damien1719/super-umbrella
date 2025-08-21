
import { openaiProvider } from "./providers/openai.provider";
import { buildSinglePrompt, type PromptParams } from "./prompts/promptbuilder";
import { ChatCompletionMessageParam, ChatCompletionCreateParams } from "openai/resources/index";
import * as guardrails from "./guardrails";

export async function generateText(
  params: PromptParams & { job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' },
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
export type TransformExcelToTableParams = { sheetName: string; html: string }

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


//DETTE ICI// -> Ancien format de tableau -> A CLEANER
export async function transformImageToTable(
  params: TransformImageToTableParams,
): Promise<{ columns: string[]; rowsGroups: string[] }> {
  const sanitized = guardrails.pre(JSON.stringify(params));
  const structured = await generateTableFromImage(
    JSON.parse(sanitized) as TransformImageToTableParams,
  );
  return guardrails.post(structured) as { columns: string[]; rowsGroups: string[] };
}

export async function transformTextToTable(
  params: TransformTextToTableParams,
): Promise<{ columns: string[]; rowsGroups: string[] }> {
  const sanitized = guardrails.pre(JSON.stringify(params));
  const structured = await generateTableFromText(
    JSON.parse(sanitized) as TransformTextToTableParams,
  );
  return guardrails.post(structured) as { columns: string[]; rowsGroups: string[] };
}

// Convert a basic HTML table to a markdown table
function htmlTableToMarkdown(html: string): string {
  const clean = html
    .replace(/<\/(thead|tbody)>/gi, '')
    .replace(/\n|\r/g, ' ')
    .replace(/\s{2,}/g, ' ');

  const tableMatch = clean.match(/<table[\s\S]*?<\/table>/i);
  if (!tableMatch) return clean;
  const tableHtml = tableMatch[0];

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
  const stripTags = (s: string) => s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  const rows: string[][] = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(tableHtml))) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowHtml))) {
      cells.push(stripTags(cellMatch[2]));
    }
    if (cells.length > 0) rows.push(cells);
  }
  if (rows.length === 0) return clean;

  const header = rows[0];
  const md: string[] = [];
  md.push(`| ${header.join(' | ')} |`);
  md.push(`| ${header.map(() => '---').join(' | ')} |`);
  for (let i = 1; i < rows.length; i++) {
    md.push(`| ${rows[i].join(' | ')} |`);
  }
  return md.join('\n');
}

export async function transformExcelToTable(
  params: TransformExcelToTableParams,
): Promise<{ columns: string[]; rowsGroups: string[] }> {
  const sanitized = JSON.parse(guardrails.pre(JSON.stringify(params))) as TransformExcelToTableParams;
  const markdown = htmlTableToMarkdown(sanitized.html);
  const structured = await generateTableFromText({ content: markdown });
  return guardrails.post(structured) as { columns: string[]; rowsGroups: string[] };
}
