'use client';

import type React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Save, Loader2 } from 'lucide-react';
import { BilanTypeConstructionCard } from './BilanTypeConstructionCard';

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
}

export function BilanTypeConstruction({
  bilanName,
  setBilanName,
  selectedElements,
  isSaving,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemoveElement,
  onAddHeading,
  onRenameHeading,
  onSave,
}: BilanTypeConstructionProps) {
  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Construction du Type de Bilan</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving || !bilanName}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
          </div>
          <Input
            placeholder="Nom du type de bilan..."
            value={bilanName}
            onChange={(e) => setBilanName(e.target.value)}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={() => onAddHeading()}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter une grande partie
            </Button>
          </div>
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
                <BilanTypeConstructionCard
                  key={element.id}
                  element={element}
                  index={index}
                  draggedIndex={draggedIndex}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  onRemove={onRemoveElement}
                  onRenameHeading={onRenameHeading}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
