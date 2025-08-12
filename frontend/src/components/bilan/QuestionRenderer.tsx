import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chip } from './Chip';
import { TableQuestion } from './TableQuestion';
import type { Question } from '@/types/question';

const FIELD_BASE =
  'rounded-lg border border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:outline-none';
const FIELD_DENSE = 'h-9 px-3';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  setError: (msg: string) => void;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  setError,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'notes':
      return (
        <Textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.contenu}
          className={`min-h-20 ${FIELD_BASE}`}
        />
      );
    case 'choix-multiple':
      const selected =
        typeof value === 'object' && value !== null
          ? (value as any).option
          : value;
      const comment =
        typeof value === 'object' && value !== null
          ? (value as any).commentaire || ''
          : '';
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {question.options?.map((opt) => (
              <Chip
                key={opt}
                selected={selected === opt}
                onClick={() => onChange({ option: opt, commentaire: comment })}
              >
                {opt}
              </Chip>
            ))}
          </div>
          {question.commentaire !== false && (
            <div className="space-y-1 w-full">
              <Textarea
                value={comment}
                onChange={(e) =>
                  onChange({
                    option: selected || '',
                    commentaire: e.target.value,
                  })
                }
                placeholder="Commentaire"
              />
            </div>
          )}
        </div>
      );
    case 'echelle':
      return (
        <div className="space-y-1">
          <Input
            type="number"
            value={String(value ?? '')}
            min={question.echelle?.min}
            max={question.echelle?.max}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v);
              if (!question.echelle) return;
              if (v === '') {
                setError('');
                return;
              }
              const num = Number(v);
              if (
                isNaN(num) ||
                num < question.echelle.min ||
                num > question.echelle.max
              ) {
                setError(
                  `Valeur entre ${question.echelle.min} et ${question.echelle.max}`,
                );
              } else {
                setError('');
              }
            }}
            className={`${FIELD_BASE} ${FIELD_DENSE}`}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      );
    case 'tableau':
      return (
        <TableQuestion question={question} value={value} onChange={onChange} />
      );
    case 'titre':
      return null;
    default:
      return null;
  }
}
