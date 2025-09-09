'use client';

import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, X, Eye, Link, ExternalLink } from 'lucide-react';

type SelectedElement =
  | {
      kind: 'section';
      id: string;
      type: string;
      title: string;
      description: string;
      metier?: string;
      order: number;
    }
  | {
      kind: 'heading';
      id: string;
      title: string;
      order: number;
    };

interface BilanTypeConstructionCardProps {
  element: SelectedElement;
  index: number;
  draggedIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnd: () => void;
  onRemove: (index: number) => void;
  onRenameHeading: (index: number, title: string) => void;
}

const typeColors: Record<string, string> = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
};
const typeLabels: Record<string, string> = {
  default: 'Section',
};

export function BilanTypeConstructionCard({
  element,
  index,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onRenameHeading,
}: BilanTypeConstructionCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`p-4 border border-wood-200 rounded-lg bg-card cursor-move transition-all ${
        draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground hover:text-foreground cursor-grab">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1">
          {element.kind === 'heading' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  Grande partie
                </Badge>
              </div>
              <Input
                value={element.title}
                placeholder="Titre"
                onChange={(e) => onRenameHeading(index, e.target.value)}
                className="font-medium mb-1"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge className={typeColors['default']}>
                  {typeLabels['default']}
                </Badge>
              </div>
              <h4 className="font-medium mb-1">{element.title}</h4>
              <p className="text-sm text-muted-foreground">
                {(element as any).description}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {element.kind === 'section' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/creation-trame/${element.id}`, '_blank', 'noopener,noreferrer');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
