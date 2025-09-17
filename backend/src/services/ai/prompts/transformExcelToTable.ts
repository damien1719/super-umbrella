import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { openaiProvider } from '../providers/openai.provider'

export interface TransformExcelToTableParams {
  sheetName: string
  csv: string // CSV du sheet, séparateur ','
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
          id: { type: 'string' },
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
          id: { type: 'string' },
          title: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string' },
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

export function buildTransformExcelToTablePrompt(params: TransformExcelToTableParams) {
  const msgs: ChatCompletionMessageParam[] = []
  msgs.push({
    role: 'system',
    content:
      (params.systemPrompt ??
        'Tu reçois un onglet Excel converti en CSV. Reconstitue un tableau structuré et renvoie uniquement un JSON valide selon le schéma.').trim(),
  })

  const hint = `### Feuille: ${params.sheetName}\nCSV:\n${params.csv}`
  msgs.push({ role: 'user', content: hint })

  const schemaStr = JSON.stringify(DEFAULT_SCHEMA, null, 2)
  msgs.push({ role: 'user', content: `### Schéma JSON\n\`\`\`json\n${schemaStr}\n\`\`\`` })
  msgs.push({
    role: 'user',
    content: `### Instructions\n${(
      params.instructions ??
      'Identifie les colonnes (à partir de la 1ère ligne) et les lignes (1ère colonne), assemble par groupes si nécessaire, et renvoie uniquement un JSON valide.'
    ).trim()}`,
  })
  return msgs
}

export async function generateTableFromExcel(params: TransformExcelToTableParams) {
  const messages = buildTransformExcelToTablePrompt(params)
  const raw = await openaiProvider.chat({
    messages: messages as unknown as import('openai/resources/index').ChatCompletionMessageParam[],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transformExcelToTable',
        strict: true,
        schema: DEFAULT_SCHEMA,
      },
    },
  } as unknown as import('openai/resources/index').ChatCompletionCreateParams)
  if (!raw) throw new Error('No content in response from LLM provider')
  return JSON.parse(raw)
}

