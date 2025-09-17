import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { openaiProvider } from '../providers/openai.provider'


export interface TransformImageToTableParams {
  imageBase64: string
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

export function buildTransformImageToTablePrompt(
  params: TransformImageToTableParams,
) {
  const msgs: ChatCompletionMessageParam[] = []

  msgs.push({
    role: 'system',
    content:
      (params.systemPrompt ??
        'Tu extrais un tableau présent dans une image et tu renvoies un JSON structuré.').trim(),
  })

  const instructionText = `### Instructions\n${(
    params.instructions ??
    "Identifie les définitions de colonnes et de groupes de lignes, ainsi que leurs propriétés, et renvoie **uniquement** un JSON valide selon le schéma ci-dessus."
  ).trim()}`

  msgs.push({
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${params.imageBase64}`,
        },
      },
      { type: 'text', text: instructionText },
    ],
  })

  const schemaStr = JSON.stringify(DEFAULT_SCHEMA)
  msgs.push({
    role: 'user',
    content: `### Schéma de sortie structuré (JSON)\n\`\`\`json\n${schemaStr}\n\`\`\``,
  })

  return msgs
}

export async function generateTableFromImage(
  params: TransformImageToTableParams,
) {
  const messages = buildTransformImageToTablePrompt(params)
  const raw = await openaiProvider.chat({
    // model is selected by provider (Azure deployment or OpenAI default)
    messages: messages as unknown as import('openai/resources/index').ChatCompletionMessageParam[],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transformImageToTable',
        strict: true,
        schema: DEFAULT_SCHEMA,
      },
    },
  } as unknown as import('openai/resources/index').ChatCompletionCreateParams)

  if (!raw) {
    throw new Error('No content in response from LLM provider')
  }

  return JSON.parse(raw)
}
