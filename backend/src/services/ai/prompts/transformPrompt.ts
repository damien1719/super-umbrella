import OpenAI from 'openai'
import { SingleMessage } from './promptbuilder'

export interface TransformPromptParams {
  systemPrompt?: string
  contextData?: string
  instructions?: string
  outputSchema: string
  userContent: string
}

const ITEM_SCHEMA = {
    type: 'array',
    additionalProperties: false,
    items: {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: { type: 'string' },
        type: {
          type: 'string',
          enum: ['notes', 'choix-multiple', 'echelle'],
        },
        titre: { type: 'string' },
        contenu: { type: 'string' },
        options: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['id','type','titre','contenu','options']
    },
  }

const DEFAULT_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
      result: {
        type: 'array',
        additionalProperties: false,
        items: ITEM_SCHEMA
      }
    },
    required: ['result']
  }

export function buildTransformPrompt(params: TransformPromptParams): SingleMessage[] {
  const msgs: SingleMessage[] = []

  msgs.push({
    role: 'system',
    content: (params.systemPrompt ?? `Vous êtes un générateur de JSON.`).trim(),
  })

  if (params.contextData) {
    msgs.push({
      role: 'user',
      content: `### Contexte\n${params.contextData.trim()}`,
    })
  }

  const defaultInstr = `
Pour chaque question en entrée :
1. Génère un **id** unique basé sur un timestamp en millisecondes (format string).
2. Détecte le **type** :
   - "notes" si question ouverte.
   - "choix-multiple" si tu trouves des options entre parenthèses ou séparées par des virgules.
   - "echelle" si tu repères une mention d'échelle (1-5, 1-10, etc.).
  `.trim()
  msgs.push({
    role: 'user',
    content: `### Instructions\n${(params.instructions ?? defaultInstr).trim()}`,
  })


  const schemaStr = JSON.stringify(DEFAULT_SCHEMA)
  msgs.push({
    role: 'user',
    content: `### Schéma de sortie structuré (JSON)\n\`\`\`json\n${schemaStr}\n\`\`\``,
  })


  msgs.push({
    role: 'user',
    content: `### Données à transformer\n${params.userContent.trim()}`,
  })

  return msgs
}

export async function generateStructuredJSON(params: TransformPromptParams) {
  const openai = new OpenAI()

  const messages = [...buildTransformPrompt(params)]
  const rawSchema = DEFAULT_SCHEMA

const schemaObject = {
  ...rawSchema,
  additionalProperties: false,
}


  const response = await openai.chat.completions.create({
    model: 'gpt-4o-2024-08-06', // ou gpt-4o-mini
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transformPrompt',
        strict: true,
        schema: schemaObject,
      },
    },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content in response from OpenAI API')
  }
  
  return JSON.parse(content)
}
