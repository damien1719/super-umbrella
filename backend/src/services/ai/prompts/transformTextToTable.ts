import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

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
          id:        { type: 'string' },
          label:     { type: 'string' },
          valueType: {
            type: 'string',
            enum: ['bool', 'number', 'text', 'choice', 'image'],
          },
        },
        required: ['id', 'label', 'valueType'],
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
  const openai = new OpenAI()
  const messages = buildTransformTextToTablePrompt(params)

  console.log(messages, "messages");

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-2025-04-14',
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transformTextToTable',
        strict: true,
        schema: DEFAULT_SCHEMA,
      },
    },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content in response from OpenAI API')
  }

  console.log(content, "content");

  return JSON.parse(content)
}

