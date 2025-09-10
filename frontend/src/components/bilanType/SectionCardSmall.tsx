'use client';

import { Badge } from '@/components/ui/badge';
import JobBadge from '@/components/ui/job-badge';
import type { BilanElement } from './SectionDisponible';
import {
  categories,
  getCategoryLabel,
  categoryBadgeClass,
} from '@/types/trame';

interface SectionCardSmallProps {
  element: BilanElement;
  onAdd: (element: BilanElement) => void;
}

export function SectionCardSmall({ element, onAdd }: SectionCardSmallProps) {
  const category = categories.find((c) => c.id === element.type);
  const coverSrc = category?.image ?? '/bilan-type.png';
  const categoryLabel = getCategoryLabel(element.type);
  const catBadge =
    categoryBadgeClass[element.type] ??
    'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div
      className="group flex items-stretch gap-0 border border-wood-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onAdd(element)}
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
      <div className="flex-1 p-2 md:p-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-xs md:text-sm text-gray-900 line-clamp-2">
            {element.title}
          </h4>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {/* Category badge */}
          <Badge className={catBadge}>{categoryLabel}</Badge>

          {/* Job badge (reuse the component from BilanTypeCard) */}
          {element.metier && (
            <JobBadge
              job={element.metier}
              className="bg-ocean-600 text-white"
            />
          )}
        </div>

        {element.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {element.description}
          </p>
        )}
      </div>
    </div>
  );
}
