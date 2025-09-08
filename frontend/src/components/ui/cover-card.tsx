import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CoverCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  coverSrc?: string | null;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function CoverCard({
  title,
  subtitle,
  actions,
  meta,
  footerLeft,
  footerRight,
  coverSrc,
  selected,
  className,
  onClick,
}: CoverCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative hover:shadow-xl transition-shadow cursor-pointer max-w-120 w-full rounded-xl overflow-hidden gap-0 py-0',
        selected && 'ring-2 ring-primary-500',
        className,
      )}
    >
      <div className="relative bg-wood-100 aspect-[5/3] w-full overflow-hidden">
        {coverSrc ? (
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-md bg-primary-50 text-primary-700 ring-1 ring-primary-100 flex items-center justify-center" />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold text-gray-900 line-clamp-2">
              {title}
            </div>
            {subtitle && (
              <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-1 shrink-0">{actions}</div>
          )}
        </div>

        {meta && <div className="mt-3 text-sm">{meta}</div>}

        {(footerLeft || footerRight) && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">{footerLeft}</div>
            <div>{footerRight}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
