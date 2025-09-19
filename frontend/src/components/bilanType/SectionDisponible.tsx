'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { SectionCardSmall } from './SectionCardSmall';

// ✅ use your shared domain types & data
import type { CategoryId, Category } from '@/types/trame';
import { categories, getCategoryLabel } from '@/types/trame';
import type { Job } from '@/types/job';
import { jobOptions } from '@/types/job';

// -------------------- Types --------------------

export interface BilanElement {
  id: string;
  type: CategoryId;
  title: string;
  description: string;
  metier?: Job;
}

interface SectionDisponibleProps {
  availableElements: BilanElement[];
  onAddElement: (element: BilanElement) => void;
  onOpenExplorer?: () => void;
}

// Use shared label helper from types
const categoryLabel = (id: CategoryId) => getCategoryLabel(id);

// -------------------- Component --------------------

export function SectionDisponible({
  availableElements,
  onAddElement,
  onOpenExplorer,
}: SectionDisponibleProps) {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | CategoryId>('all');
  const [filterMetier, setFilterMetier] = useState<'all' | Job>('all');
  const [displayLimit, setDisplayLimit] = useState(8);

  const predicate = (element: BilanElement) => {
    const matchesSearch =
      searchText === '' ||
      element.title.toLowerCase().includes(searchText.toLowerCase()) ||
      element.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesType = filterType === 'all' || element.type === filterType;
    const matchesMetier =
      filterMetier === 'all' || element.metier === filterMetier;

    return matchesSearch && matchesType && matchesMetier;
  };

  const filteredElements = useMemo(
    () => availableElements.filter(predicate).slice(0, displayLimit),
    [searchText, filterType, filterMetier, displayLimit, availableElements],
  );

  const hasMoreResults = useMemo(
    () => availableElements.filter(predicate).length > displayLimit,
    [searchText, filterType, filterMetier, displayLimit, availableElements],
  );

  const loadMoreResults = () => setDisplayLimit((prev) => prev + 8);

  const resetFilters = () => {
    setSearchText('');
    setFilterType('all');
    setFilterMetier('all');
    setDisplayLimit(8);
  };

  return (
    <Card className="lg:col-span-1 flex flex-col h-[90vh]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Liste des parties disponibles
          </CardTitle>
          {onOpenExplorer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenExplorer}
              className="whitespace-nowrap"
            >
              Explorer les parties
            </Button>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un test, anamnèse..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            {/* Type d'élément (CategoryId) */}
            <Select
              value={filterType}
              onValueChange={(v) => setFilterType(v as 'all' | CategoryId)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type d'élément" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Métier (Job) */}
            <Select
              value={filterMetier}
              onValueChange={(v) => setFilterMetier(v as 'all' | Job)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Métier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les métiers</SelectItem>
                {jobOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchText || filterType !== 'all' || filterMetier !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="w-full bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 overflow-y-auto pr-1">
        {filteredElements.map((element) => (
          <SectionCardSmall
            key={element.id}
            element={element}
            onAdd={onAddElement}
          />
        ))}

        {hasMoreResults && (
          <Button
            variant="outline"
            className="w-full mt-4 bg-transparent"
            onClick={loadMoreResults}
          >
            Afficher plus de résultats
          </Button>
        )}

        {filteredElements.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun élément trouvé</p>
            <p className="text-xs">Essayez de modifier vos filtres</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
