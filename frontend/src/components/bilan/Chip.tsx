import { Check } from 'lucide-react';
import * as React from 'react';

interface ChipProps {
  selected: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export function Chip({ selected, children, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
        selected
          ? 'bg-primary-50 text-primary-700 border-primary-400'
          : 'bg-white text-gray-800 border-gray-300 hover:bg-wood-200',
        'shadow-sm',
      ].join(' ')}
    >
      {selected ? <Check className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}
