import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { openaiProvider } from '../providers/openai.provider'

export interface TransformTextToTableParams {
  content: string
  systemPrompt?: string
  instructions?: string
}

const DEFAULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    columns: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id:    { type: 'string' },
          label: { type: 'string' },
        },
        required: ['id', 'label'],
      },
    },
    rowsGroups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id:    { type: 'string' },
          title: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id:    { type: 'string' },
                label: { type: 'string' },
              },
              required: ['id', 'label'],
            },
          },
        },
        required: ['id', 'title', 'rows'],
      },
    },
  },
  required: ['columns', 'rowsGroups'],
} as const


export function buildTransformTextToTablePrompt(
  params: TransformTextToTableParams,
) {
  const msgs: ChatCompletionMessageParam[] = []

  msgs.push({
    role: 'system',
    content:
      (params.systemPrompt ??
        "Tu extrais un tableau présent dans un texte (plain ou HTML) et tu renvoies un JSON structuré.").trim(),
  })

  const instructionText = `### Instructions\n${(
    params.instructions ??
    "Identifie les définitions de colonnes et de groupes de lignes, ainsi que leurs propriétés, et renvoie **uniquement** un JSON valide selon le schéma ci-dessus."
  ).trim()}`

  msgs.push({ role: 'user', content: params.content })

  const schemaStr = JSON.stringify(DEFAULT_SCHEMA, null, 2)
  msgs.push({
    role: 'user',
    content: `### Schéma de sortie structuré (JSON)\n\`\`\`json\n${schemaStr}\n\`\`\``,
  })

  msgs.push({ role: 'user', content: instructionText })

  return msgs
}

export async function generateTableFromText(
  params: TransformTextToTableParams,
) {
  const messages = buildTransformTextToTablePrompt(params)

  console.log(messages, "messages");

  const raw = await openaiProvider.chat({
    messages: messages as unknown as import('openai/resources/index').ChatCompletionMessageParam[],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transformTextToTable',
        strict: true,
        schema: DEFAULT_SCHEMA,
      },
    },
  } as unknown as import('openai/resources/index').ChatCompletionCreateParams)

  if (!raw) {
    throw new Error('No content in response from LLM provider')
  }

  console.log(raw, "content");

  return JSON.parse(raw)
}
