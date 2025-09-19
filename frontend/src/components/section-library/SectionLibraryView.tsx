'use client';

import { useEffect, useMemo, useState } from 'react';
import TrameCard, { type TrameInfo } from '@/components/TrameCard';
import { Tabs } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchField } from '@/components/ui/search-field';
import { categories } from '@/types/trame';
import type { Section } from '@/store/sections';
import type { Job } from '@/types/job';
import { jobOptions } from '@/types/job';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionLibraryTabConfig {
  key: string;
  label: ReactNode;
  sections: Section[];
  hidden?: boolean;
}

type JobFilterValue = Job | 'ALL';

type MapSectionToCard = (section: Section) => TrameInfo;

type ShouldFlagSection = (section: Section) => boolean;

type SectionActionResolver = (section: Section) => void | Promise<void>;

type FooterRenderer = (section: Section) => ReactNode;

export interface SectionLibraryViewProps {
  tabs: SectionLibraryTabConfig[];
  initialTab?: string;
  selectedSectionId?: string | null;
  onSelectSection?: (section: Section) => void;
  onPreviewSection?: (section: Section) => void;
  onDuplicateSection?: SectionActionResolver;
  onDeleteSection?: SectionActionResolver;
  canDuplicateSection?: ShouldFlagSection;
  canDeleteSection?: ShouldFlagSection;
  showLinkForSection?: ShouldFlagSection;
  footerRightForSection?: FooterRenderer;
  mapSectionToCard?: MapSectionToCard;
  toolbarActions?: ReactNode;
  jobFilterEnabled?: boolean;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyState?: ReactNode;
}

const defaultMapper: MapSectionToCard = (section) => ({
  id: section.id,
  title: section.title,
  description: section.description,
  coverUrl: section.coverUrl,
  job: section.job,
  sharedBy: section.author?.prenom ?? null,
});

export function SectionLibraryView({
  tabs,
  initialTab,
  selectedSectionId,
  onSelectSection,
  onPreviewSection,
  onDuplicateSection,
  onDeleteSection,
  canDuplicateSection,
  canDeleteSection,
  showLinkForSection,
  footerRightForSection,
  mapSectionToCard = defaultMapper,
  toolbarActions,
  jobFilterEnabled = true,
  searchEnabled = true,
  searchPlaceholder = 'Rechercher une partie...',
  isLoading,
  emptyState,
}: SectionLibraryViewProps) {
  const visibleTabs = useMemo(() => tabs.filter((t) => !t.hidden), [tabs]);

  const computedInitialTab = useMemo(() => {
    if (initialTab && visibleTabs.some((t) => t.key === initialTab)) {
      return initialTab;
    }
    return visibleTabs[0]?.key ?? tabs[0]?.key ?? '';
  }, [initialTab, tabs, visibleTabs]);

  const [activeTab, setActiveTab] = useState(computedInitialTab);
  const [jobFilter, setJobFilter] = useState<JobFilterValue>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setActiveTab(computedInitialTab);
  }, [computedInitialTab]);

  const activeTabConfig = useMemo(
    () =>
      tabs.find((t) => t.key === activeTab) ??
      visibleTabs[0] ??
      tabs[0] ?? {
        key: '',
        label: '',
        sections: [],
      },
    [activeTab, tabs, visibleTabs],
  );

  const matchesJobFilter = (section: Section) => {
    if (!jobFilterEnabled || jobFilter === 'ALL') return true;
    return Array.isArray(section.job) && section.job.includes(jobFilter);
  };

  const matchesSearch = (section: Section) => {
    if (!searchEnabled) return true;
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    return (
      section.title.toLowerCase().includes(lower) ||
      (section.description ?? '').toLowerCase().includes(lower)
    );
  };

  const filteredSections = useMemo(
    () =>
      activeTabConfig.sections.filter(matchesJobFilter).filter(matchesSearch),
    [
      activeTabConfig.sections,
      jobFilter,
      jobFilterEnabled,
      searchEnabled,
      searchTerm,
    ],
  );

  const hasAnySection = tabs.some((tab) => tab.sections.length > 0);

  return (
    <div className="space-y-4">
      {visibleTabs.length > 1 && (
        <Tabs
          tabs={visibleTabs.map((tab) => ({
            key: tab.key,
            label: tab.label,
            count: tab.sections.length,
          }))}
          active={activeTabConfig.key}
          onChange={setActiveTab}
        />
      )}

      {(jobFilterEnabled || searchEnabled || toolbarActions) && (
        <div className="flex flex-wrap items-center gap-3">
          {jobFilterEnabled && (
            <Select
              value={jobFilter}
              onValueChange={(value) => setJobFilter(value as JobFilterValue)}
            >
              <SelectTrigger aria-label="Filtrer par métier" className="w-56">
                <SelectValue placeholder="Tous les métiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les métiers</SelectItem>
                {jobOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {searchEnabled && (
            <div className="flex-1 min-w-64 max-w-96">
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={searchPlaceholder}
              />
            </div>
          )}

          {toolbarActions}

          {jobFilterEnabled && jobFilter !== 'ALL' && (
            <div className="ml-auto text-sm text-gray-600">
              Filtre métier :{' '}
              {jobOptions.find((opt) => opt.id === jobFilter)?.label ??
                jobFilter}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : !hasAnySection ? (
        (emptyState ?? (
          <div className="text-center text-gray-500">
            Aucune partie disponible.
          </div>
        ))
      ) : filteredSections.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          Aucune partie ne correspond à votre recherche.
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const sectionsForCategory = filteredSections.filter(
              (section) => section.kind === category.id,
            );

            if (sectionsForCategory.length === 0) return null;

            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({sectionsForCategory.length} sections)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sectionsForCategory.map((section) => {
                    const cardInfo = mapSectionToCard(section);
                    const isSelected = selectedSectionId === section.id;
                    const showLink = showLinkForSection?.(section) ?? false;
                    const allowDuplicate =
                      canDuplicateSection?.(section) ?? !!onDuplicateSection;
                    const allowDelete = canDeleteSection?.(section) ?? false;

                    return (
                      <TrameCard
                        key={section.id}
                        trame={cardInfo}
                        kind={category.id}
                        selected={isSelected}
                        onSelect={
                          onSelectSection
                            ? () => onSelectSection(section)
                            : undefined
                        }
                        onPreview={
                          onPreviewSection
                            ? () => onPreviewSection(section)
                            : undefined
                        }
                        onDuplicate={
                          allowDuplicate && onDuplicateSection
                            ? () => onDuplicateSection(section)
                            : undefined
                        }
                        onDelete={
                          allowDelete && onDeleteSection
                            ? () => onDeleteSection(section)
                            : undefined
                        }
                        showLink={showLink}
                        showDuplicate={allowDuplicate && !!onDuplicateSection}
                        showDelete={allowDelete && !!onDeleteSection}
                        footerRight={footerRightForSection?.(section)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SectionLibraryView;
