import * as React from 'react';

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface LeftNavItem {
  id: string;
  title: string;
  index?: number;
  disabled?: boolean;
  kind?: 'section' | 'separator';
}

interface LeftNavBilanTypeProps {
  items: LeftNavItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onToggleDisabled?: (id: string) => void;
}

export function LeftNavBilanType({
  items,
  activeId,
  onSelect,
  onToggleDisabled,
}: LeftNavBilanTypeProps) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-wood-200 bg-white sticky top-0 h-[calc(100vh-120px)]">
      <div className="flex flex-col w-full">
        <div className="px-3 py-2 border-b border-wood-200 text-sm text-muted-foreground">
          Sections ({items.filter((i) => i.kind !== 'separator').length})
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((it, i) => {
            if (it.kind === 'separator') {
              return (
                <div
                  key={it.id}
                  className="px-3 py-2 mt-2 text-[11px] uppercase tracking-wide text-gray-500 border-t border-wood-200"
                >
                  {it.title}
                </div>
              );
            }
            const active = it.id === activeId;
            return (
              <button
                key={it.id}
                onClick={() => onSelect(it.id)}
                className={cn(
                  'group relative w-full flex items-center gap-3 px-3 py-2 text-left text-sm',
                  active
                    ? 'bg-muted/40 font-medium bg-primary-50'
                    : 'hover:bg-muted/30',
                  it.disabled ? 'opacity-50' : '',
                )}
              >
                <span
                  className={cn(
                    'absolute left-0 top-0 h-full w-0.5 rounded-r',
                    active ? 'bg-primary' : 'bg-transparent',
                  )}
                />
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded border-wood-200 text-[11px]',
                    active
                      ? 'border-primary text-primary'
                      : 'border-wood-200 text-gray-500',
                  )}
                >
                  {(it.index ?? i) + 1}
                </span>
                <span className="truncate flex-1">{it.title}</span>
                {onToggleDisabled && (
                  <span
                    className="ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDisabled?.(it.id);
                    }}
                  >
                    {it.disabled ? (
                      <EyeOff
                        className={cn(
                          'h-4 w-4',
                          active ? 'text-primary' : 'text-gray-500',
                        )}
                      />
                    ) : (
                      <Eye
                        className={cn(
                          'h-4 w-4',
                          active ? 'text-primary' : 'text-gray-500',
                        )}
                      />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default LeftNavBilanType;
