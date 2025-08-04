import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white shadow hover:bg-primary-700',
        black: 'bg-black text-white shadow hover:bg-black/80',
        primary: 'bg-primary-500 text-white shadow hover:bg-primary-600',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
        outline:
          'border border-gray-300 bg-white shadow-sm hover:bg-primary-50 hover:text-primary-700',
        secondary: 'bg-wood-200 text-gray-800 shadow-sm hover:bg-wood-300',
        ghost: 'hover:bg-primary-50 hover:text-primary-700',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        icon: 'bg-transparent hover:bg-wood-200 hover:text-primary-700',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        micro: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
