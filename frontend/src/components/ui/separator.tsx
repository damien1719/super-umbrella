import * as React from 'react';
import { cn } from '../../lib/utils';

export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('my-4 h-px w-full bg-gray-200', className)}
    {...props}
  />
));
Separator.displayName = 'Separator';
