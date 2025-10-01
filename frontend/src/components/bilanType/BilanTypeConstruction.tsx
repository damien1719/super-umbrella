'use client';

import type React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SectionCardSmall } from './SectionCardSmall';
import type { CategoryId } from '@/types/trame';
import type { Job } from '@/types/job';

type SelectedElement =
  | {
      kind: 'section';
      id: string;
      type: CategoryId;
      title: string;
      description: string;
      metier?: Job;
      order: number;
    }
  | {
      kind: 'heading';
      id: string;
      title: string;
      order: number;
    };

interface BilanTypeConstructionProps {
  bilanName: string;
  setBilanName: (name: string) => void;
  selectedElements: SelectedElement[];
  isSaving?: boolean;
  draggedIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
  onDragEnd: () => void;
  onRemoveElement: (index: number) => void;
  onAddHeading: (title?: string) => void;
  onRenameHeading: (index: number, title: string) => void;
  onSave: () => void;
  onOpenSection?: (id: string) => void | Promise<void>;
  onAfterDuplicate?: (
    originalId: string,
    created: import('@/store/sections').Section,
  ) => void | Promise<void>;
}

export function BilanTypeConstruction({
  selectedElements,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemoveElement,
  onAddHeading,
  onRenameHeading,
  onOpenSection,
  onAfterDuplicate,
}: BilanTypeConstructionProps) {
  return (
    <>
      <Card className="lg:col-span-2 pt-4">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              Les parties qui composent votre bilan
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => onAddHeading()}>
              <Plus className="mr-2 size-4" /> Titre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedElements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                Cliquez sur les éléments de gauche pour commencer à construire
                votre bilan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedElements.map((element, index) => (
                <SectionCardSmall
                  key={element.id}
                  context="builder"
                  element={element}
                  dnd={{
                    index,
                    draggedIndex,
                    onDragStart,
                    onDragOver,
                    onDrop,
                    onDragEnd,
                  }}
                  actions={{
                    onRemove: onRemoveElement,
                    onRenameHeading,
                    onOpen: onOpenSection,
                    onAfterDuplicate,
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
