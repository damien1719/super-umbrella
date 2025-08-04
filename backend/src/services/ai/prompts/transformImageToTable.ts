import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

export interface TransformImageToTableParams {
  imageBase64: string
  systemPrompt?: string
  instructions?: string
}

const DEFAULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    colonnes: { type: 'array', items: { type: 'string' } },
    lignes: { type: 'array', items: { type: 'string' } },
  },
  required: ['colonnes', 'lignes'],
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
    "Identifie les intitulés des colonnes et des lignes du tableau contenu dans l'image. Retourne uniquement un JSON conforme au schéma fourni."
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
  const openai = new OpenAI()
  const messages = buildTransformImageToTablePrompt(params)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transformImageToTable',
        strict: true,
        schema: DEFAULT_SCHEMA,
      },
    },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content in response from OpenAI API')
  }

  return JSON.parse(content)
}

