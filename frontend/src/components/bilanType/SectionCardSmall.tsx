'use client';

import { Badge } from '@/components/ui/badge';
import JobBadge from '@/components/ui/job-badge';
import OriginTag from '@/components/ui/origin-tag';
import {
  categories,
  getCategoryLabel,
  categoryBadgeClass,
  type CategoryId,
} from '@/types/trame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Copy, Expand, GripVertical, X } from 'lucide-react';
import type { Job } from '@/types/job';
import type { Origin } from '@/components/ui/origin-tag';
import { useMemo, useState } from 'react';
import { useSectionStore, type Section } from '@/store/sections';

// Unified element types
type ElementBase = {
  id: string;
  title: string;
  metier?: Job;
  origin?: Origin;
};

export type SectionElement = ElementBase & {
  kind: 'section';
  type: CategoryId;
  description: string;
  order?: number;
};

export type HeadingElement = {
  kind: 'heading';
  id: string;
  title: string;
  order?: number;
};

type ElementLike = SectionElement | HeadingElement;

type Actions = {
  onAdd?: (element: SectionElement) => void;
  onPreview?: () => void;
  onOpen?: (id: string) => void | Promise<void>;
  onAfterDuplicate?: (originalId: string, created: Section) => void | Promise<void>;
  onRemove?: (index: number) => void;
  onRenameHeading?: (index: number, title: string) => void;
};

type Dnd = {
  index: number;
  draggedIndex?: number | null;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnd?: () => void;
};

interface SectionCardSmallProps {
  context: 'library' | 'builder';
  element: ElementLike;
  actions?: Actions;
  dnd?: Dnd;
  flags?: {
    hideOpenAction?: boolean;
    hideDuplicate?: boolean;
    clickAction?: 'preview' | 'add' | 'none';
  };
}

export function SectionCardSmall({ context, element, actions, dnd, flags }: SectionCardSmallProps) {
  const navigate = useNavigate();
  const [isDuplicating, setIsDuplicating] = useState(false);

  const isHeading = (e: ElementLike): e is HeadingElement => e.kind === 'heading';
  const isSection = (e: ElementLike): e is SectionElement => e.kind === 'section';

  const showCreateVersion = (origin?: Origin) => origin === 'BILANPLUME' || origin === 'COMMUNITY';

  const doDuplicate = async (sectionId: string) => {
    try {
      setIsDuplicating(true);
      const created = await useSectionStore.getState().duplicate(sectionId);
      await actions?.onAfterDuplicate?.(sectionId, created);
    } catch (e) {
      // Best-effort: ignore UI error handling for now
    } finally {
      setIsDuplicating(false);
    }
  };

  const coverSrc = useMemo(() => {
    if (isSection(element)) {
      return categories.find((c) => c.id === element.type)?.image ?? '/bilan-type.png';
    }
    return '/bilan-type.png';
  }, [element]);

  const clickAction: 'preview' | 'add' | 'none' = useMemo(() => {
    if (flags?.clickAction) return flags.clickAction;
    if (context === 'library') return actions?.onPreview ? 'preview' : actions?.onAdd ? 'add' : 'none';
    return 'none';
  }, [context, actions, flags]);

  const draggedIndex = dnd?.draggedIndex;
  const index = dnd?.index;

  return (
    <div
      draggable={context === 'builder' && !!dnd}
      onDragStart={(e) => dnd?.onDragStart && index != null && dnd.onDragStart(e, index)}
      onDragOver={(e) => dnd?.onDragOver && dnd.onDragOver(e)}
      onDrop={(e) => dnd?.onDrop && index != null && dnd.onDrop(e, index)}
      onDragEnd={() => dnd?.onDragEnd && dnd.onDragEnd()}
      className={`group flex items-stretch gap-0 border border-wood-200 rounded-xl overflow-hidden bg-white transition-all ${
        context === 'library' && clickAction !== 'none' ? 'cursor-pointer hover:shadow-md' : 'select-none hover:shadow-md'
      } ${draggedIndex != null && index === draggedIndex ? 'opacity-50 scale-[0.99]' : ''}`}
      onClick={() => {
        if (!isSection(element)) return;
        if (clickAction === 'preview') actions?.onPreview?.();
        else if (clickAction === 'add') actions?.onAdd?.(element);
      }}
    >
      {/* Left cover */}
      <div className="hidden sm:flex w-24 md:w-24 bg-wood-100 items-center justify-center">
        <img src={coverSrc} alt="" loading="lazy" className="max-h-24 md:max-h-24 w-auto object-contain select-none" />
      </div>

      {/* Right content */}
      <div className={`flex-1 ${context === 'library' ? 'p-2 md:p-2' : 'p-3 md:p-3'} flex flex-col`}>
        {/* Top row: title/heading on left, actions on right */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {context === 'builder' && (
              <div className="text-muted-foreground hover:text-foreground cursor-grab mt-0.5">
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            <div className="min-w-0">
              {isHeading(element) ? (
                <>
                  <div className="mb-2">
                    <Badge className="bg-wood-200 text-wood-600 border-wood-200">Titre</Badge>
                  </div>
                  {context === 'builder' ? (
                    <Input
                      value={element.title}
                      placeholder="Titre"
                      onChange={(e) => actions?.onRenameHeading && index != null && actions.onRenameHeading(index, e.target.value)}
                      className="font-medium mb-1 h-8 text-sm"
                    />
                  ) : (
                    <h4 className="font-medium text-xs md:text-sm text-gray-900 line-clamp-2">{element.title}</h4>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-xs md:text-sm text-gray-900 line-clamp-2">{element.title}</h4>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isSection(element) && showCreateVersion(element.origin) && !flags?.hideDuplicate && (
              <Button
                className="gap-2"
                variant="ghost"
                size="sm"
                disabled={isDuplicating}
                onClick={(e) => {
                  e.stopPropagation();
                  void doDuplicate(element.id);
                }}
              >
                <Copy className="h-4 w-4" />
                {isDuplicating ? 'Création…' : 'Créer ma version'}
              </Button>
            )}

            {/* Open only for section */}
            {!isHeading(element) && (context === 'library' ? !flags?.hideOpenAction : true) && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 gap-2"
                tooltip={context === 'library' ? 'Ouvrir' : 'Aperçu'}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSection(element)) {
                    if (actions?.onOpen) void actions.onOpen(element.id);
                    else navigate(`/creation-trame/${element.id}`);
                  }
                }}
              >
                <Expand className="w-4 h-4" />
                Ouvrir
              </Button>
            )}

            {/* Remove only in builder */}
            {context === 'builder' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (actions?.onRemove && index != null) actions.onRemove(index);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                aria-label="Supprimer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom row: badges and description spanning full width */}
        {isSection(element) && (
          <>
            <div className={`${context === 'library' ? 'mt-3' : 'mt-2'} flex items-center gap-2`}>
              <Badge className={categoryBadgeClass[element.type] ?? 'bg-gray-100 text-gray-800 border-gray-200'}>
                {getCategoryLabel(element.type)}
              </Badge>
              {element.metier && <JobBadge job={element.metier} className="bg-ocean-600 text-white" />}
              {element.origin && <OriginTag origin={element.origin} />}
            </div>
            {element.description && (
              <p className={`text-xs text-muted-foreground line-clamp-2 ${context === 'library' ? 'mt-2' : 'mt-1'}`}>{element.description}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
