import { Button } from '@/components/ui/button';
import JobBadge from '@/components/ui/job-badge';
import { Copy, ExternalLink, Trash2, MoreHorizontal } from 'lucide-react';

import type { Job } from '@/types/job';
import type { CategoryId } from '@/types/trame';
import { categories } from '@/types/trame';
import CoverCard from '@/components/ui/cover-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ReactNode } from 'react';

export interface TrameInfo {
  id: string;
  title: string;
  description?: string | null;
  sharedBy?: string | null;
  job?: Job[];
  coverUrl?: string | null;
}

interface TrameCardProps {
  trame: TrameInfo;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  previewLabel?: string;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showLink?: boolean;
  showDuplicate?: boolean;
  showDelete?: boolean;
  footerRight?: ReactNode;
  kind?: CategoryId;
}

export default function TrameCard({
  trame,
  selected,
  onSelect,
  onPreview,
  previewLabel = 'Aperçu',
  onDuplicate,
  onDelete,
  showLink,
  showDuplicate,
  showDelete,
  footerRight,
  kind,
}: TrameCardProps) {
  const cat = kind ? categories.find((c) => c.id === kind) : undefined;
  const imageSrc = trame.coverUrl ?? cat?.image;
  const actions = (
    <div className="flex items-center gap-1 shrink-0">
      {onPreview && (
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={(event) => {
            event.stopPropagation();
            onPreview();
          }}
        >
          {previewLabel}
        </Button>
      )}
{/*       {showLink && (
        <a
          href={`/creation-trame/${trame.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50"
          onClick={(event) => event.stopPropagation()}
          aria-label="Ouvrir la trame dans un nouvel onglet"
          title="Ouvrir"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )} */}
      {(showDuplicate || showDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
              onClick={(event) => event.stopPropagation()}
              aria-label="Plus d'actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(event) => event.stopPropagation()}
            className="w-40 bg-white border border-wood-200 shadow-sm"
          >
            {showDuplicate && onDuplicate && (
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="w-4 h-4" />
                Dupliquer
              </DropdownMenuItem>
            )}
            {showDelete && onDelete && (
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <CoverCard
      onClick={onSelect}
      selected={selected}
      coverSrc={imageSrc ?? null}
      title={trame.title}
      subtitle={
        trame.sharedBy ? <span>Partagée par {trame.sharedBy}</span> : undefined
      }
      actions={actions}
      footerLeft={
        Array.isArray(trame.job) && trame.job.length > 0
          ? trame.job.map((job) => (
              <JobBadge
                key={job}
                job={job}
                className="bg-ocean-600 text-white"
              />
            ))
          : undefined
      }
      footerRight={footerRight}
    />
  );
}
