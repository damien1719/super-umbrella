'use client';

import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, X, Eye as EyeIcon, CornerDownRight, Expand } from 'lucide-react';
import JobBadge from '@/components/ui/job-badge';
import {
  categories,
  getCategoryLabel,
  categoryBadgeClass,
  type CategoryId,
} from '@/types/trame';

type SelectedElement =
  | {
      kind: 'section';
      id: string;
      type: string; // CategoryId-like
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
  onOpenSection?: (id: string) => void | Promise<void>;
}

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
  onOpenSection,
}: BilanTypeConstructionCardProps) {
  const isSection = element.kind === 'section';
  const categoryId = (isSection ? (element as any).type : undefined) as
    | CategoryId
    | undefined;
  const category = categoryId
    ? categories.find((c) => c.id === categoryId)
    : undefined;
  const coverSrc = category?.image ?? '/bilan-type.png';
  const categoryLabel = categoryId ? getCategoryLabel(categoryId) : undefined;
  const catBadge = categoryId
    ? categoryBadgeClass[categoryId]
    : 'bg-wood-200 text-wood-600 border-wood-200';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`group flex items-stretch gap-0 border border-wood-200 rounded-xl overflow-hidden bg-white transition-all select-none ${
        draggedIndex === index ? 'opacity-50 scale-[0.99]' : 'hover:shadow-md'
      }`}
    >
      {/* Left cover */}
      <div className="hidden sm:flex w-24 md:w-24 bg-wood-100 items-center justify-center">
        <img
          src={coverSrc}
          alt=""
          loading="lazy"
          className="max-h-24 md:max-h-24 w-auto object-contain select-none"
        />
      </div>

      {/* Right content */}
      <div className="flex-1 p-3 md:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <div className="text-muted-foreground hover:text-foreground cursor-grab mt-0.5">
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              {element.kind === 'heading' ? (
                <>
                  <div className="mb-2">
                    <Badge className={catBadge}>Titre</Badge>
                  </div>
                  <Input
                    value={element.title}
                    placeholder="Titre"
                    onChange={(e) => onRenameHeading(index, e.target.value)}
                    className="font-medium mb-1 h-8 text-sm"
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    {!!categoryLabel && (
                      <Badge className={catBadge}>{categoryLabel}</Badge>
                    )}
                    {(element as any).metier && (
                      <JobBadge
                        job={(element as any).metier}
                        className="bg-ocean-600 text-white"
                      />
                    )}
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                    {element.title}
                  </h4>
                  {(element as any).description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {(element as any).description}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {element.kind === 'section' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSection?.(element.id);
                }}
                className="ml-2 gap-2"
                tooltip="Aperçu"
              >
                <Expand className="h-4 w-4" />
                  Ouvrir
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
