import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface SearchFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchField({
  value,
  onChange,
  onClear,
  className,
  placeholder = 'Rechercher…',
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-8"
        {...props}
      />
      {value && (
        <button
          type="button"
          aria-label="Effacer la recherche"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => (onClear ? onClear() : onChange(''))}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
