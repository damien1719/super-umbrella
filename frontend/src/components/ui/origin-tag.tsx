'use client';

import { cn } from '@/lib/utils';

export type Origin = 'MINE' | 'BILANPLUME' | 'COMMUNITY';

const originLabels: Record<Origin, string> = {
  MINE: 'Ma partie',
  BILANPLUME: 'Partagée par Bilan Plume',
  COMMUNITY: 'Partagée par la communauté',
};

const originClasses: Record<Origin, string> = {
  MINE: 'bg-primary-200 italic',
  BILANPLUME: 'bg-wood-300 italic',
  COMMUNITY: 'bg-wood-400 italic',
};

export default function OriginTag({
  origin,
  className,
}: {
  origin: Origin;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs',
        originClasses[origin],
        className,
      )}
    >
      {originLabels[origin]}
    </span>
  );
}

export { originLabels, originClasses };
