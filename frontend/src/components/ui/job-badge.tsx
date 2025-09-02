'use client';

import { cn } from '@/lib/utils';
import { Job, jobLabels } from '@/types/job';

export default function JobBadge({
  job,
  className,
}: {
  job: Job;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-wood-100 px-2 py-0.5 text-xs text-gray-700',
        className,
      )}
      title={jobLabels[job]}
    >
      {jobLabels[job]}
    </span>
  );
}
