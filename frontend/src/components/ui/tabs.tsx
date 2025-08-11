'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type TabItem = {
  key: string;
  label: React.ReactNode;
  count?: number;
  hidden?: boolean;
};

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  const visible = tabs.filter((t) => !t.hidden);
  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="flex gap-4 -mb-px">
        {visible.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              className={cn(
                'py-2 px-1 text-base font-medium border-b-2 transition-colors',
                isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
              onClick={() => onChange(t.key)}
            >
              <span>{t.label}</span>
              {typeof t.count === 'number' && (
                <span
                  className={cn(
                    'ml-2 rounded-full px-2 py-0.5 text-xs',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}


