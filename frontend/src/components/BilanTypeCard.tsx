import { Button } from '@/components/ui/button';
import JobBadge from '@/components/ui/job-badge';
import type { Job } from '@/types/job';
import { Trash2, Globe2, ListChecks } from 'lucide-react';
import CoverCard from '@/components/ui/cover-card';

export interface BilanTypeInfo {
  id: string;
  name: string;
  description?: string | null;
  authorPrenom?: string | null;
  isPublic?: boolean;
  testsCount?: number;
  job?: Job[];
  coverUrl?: string | null;
}

interface BilanTypeCardProps {
  bilanType: BilanTypeInfo;
  onOpen?: () => void;
  onDelete?: () => void;
}

export default function BilanTypeCard({
  bilanType,
  onOpen,
  onDelete,
}: BilanTypeCardProps) {
  const DEFAULT_COVER = '/bilan-type.png';
  const coverSrc = bilanType.coverUrl ?? DEFAULT_COVER;
  const actions = onDelete ? (
    <Button
      size="icon"
      variant="ghost"
      className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      aria-label="Supprimer"
      title="Supprimer"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : undefined;

  const title = (
    <div className="flex items-center gap-2">
      <span className="text-gray-900">{bilanType.name}</span>
      {bilanType.isPublic && (
        <span className="inline-flex items-center gap-1 rounded-full border border-coral-500 bg-white px-2 py-0.5 text-[11px] text-coral-600">
          <Globe2 className="h-3.5 w-3.5 text-coral-600" />
          Public
        </span>
      )}
    </div>
  );

  const meta =
    typeof bilanType.testsCount === 'number' ? (
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1 rounded-md ring-1 ring-ocean-600 px-2 py-1 text-ocean-600">
          <ListChecks className="h-3.5 w-3.5 text-ocean-600" />
          <span className="font-medium">{bilanType.testsCount}</span>
          <span>tests</span>
        </span>
      </div>
    ) : undefined;

  const footerLeft =
    bilanType.job && bilanType.job.length > 0 ? (
      bilanType.job.map((j) => (
        <JobBadge key={j} job={j} className="bg-ocean-600 text-white" />
      ))
    ) : (
      <span className="text-xs text-gray-500">Bilan complet</span>
    );

  return (
    <CoverCard
      onClick={onOpen}
      title={title}
      subtitle={
        bilanType.authorPrenom ? (
          <span>Partagé par {bilanType.authorPrenom}</span>
        ) : undefined
      }
      actions={actions}
      meta={meta}
      footerLeft={footerLeft}
      coverSrc={coverSrc}
    />
  );
}
