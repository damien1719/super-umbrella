'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** ── Root primitives (safe against undefined props) ───────────────────────── */

function Select(p?: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...(p ?? {})} />;
}

function SelectGroup(p?: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...(p ?? {})} />;
}

function SelectValue(p?: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...(p ?? {})} />;
}

/** ── Trigger (size prop + safe destructuring) ─────────────────────────────── */

type TriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
};

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  TriggerProps | undefined
>((p, ref) => {
  const _p = (p ?? {}) as TriggerProps;
  const { className, size = 'default', children, ...props } = _p;

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input border-wood-200 data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring  focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-36",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

/** ── Content (safe destructuring + forwardRef) ────────────────────────────── */

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentProps<typeof SelectPrimitive.Content> | undefined
>((p, ref) => {
  const _p = (p ?? {}) as React.ComponentProps<typeof SelectPrimitive.Content>;
  const { className, children, position = 'popper', ...props } = _p;

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        className={cn(
          'bg-white text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-150 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        style={{
          backgroundColor: 'white',
          WebkitBackdropFilter: 'none',
          backdropFilter: 'none',
        }}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = 'SelectContent';

/** ── Label / Item / Separator (safe destructuring + forwardRef) ──────────── */

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentProps<typeof SelectPrimitive.Label> | undefined
>((p, ref) => {
  const _p = (p ?? {}) as React.ComponentProps<typeof SelectPrimitive.Label>;
  const { className, ...props } = _p;
  return (
    <SelectPrimitive.Label
      ref={ref}
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  );
});
SelectLabel.displayName = 'SelectLabel';

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item> | undefined
>((p, ref) => {
  const _p = (p ?? {}) as React.ComponentProps<typeof SelectPrimitive.Item>;
  const { className, children, ...props } = _p;

  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = 'SelectItem';

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentProps<typeof SelectPrimitive.Separator> | undefined
>((p, ref) => {
  const _p = (p ?? {}) as React.ComponentProps<
    typeof SelectPrimitive.Separator
  >;
  const { className, ...props } = _p;
  return (
    <SelectPrimitive.Separator
      ref={ref}
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = 'SelectSeparator';

/** ── Scroll buttons (safe destructuring + forwardRef) ────────────────────── */

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollUpButton> | undefined
>((p, ref) => {
  const _p = (p ?? {}) as React.ComponentProps<
    typeof SelectPrimitive.ScrollUpButton
  >;
  const { className, ...props } = _p;

  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      data-slot="select-scroll-up-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
});
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollDownButton> | undefined
>((p, ref) => {
  const _p = (p ?? {}) as React.ComponentProps<
    typeof SelectPrimitive.ScrollDownButton
  >;
  const { className, ...props } = _p;

  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      data-slot="select-scroll-down-button"
      className={cn(
        'flex cursor-default items-center justify-center py-1',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
});
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

/** ── Exports ─────────────────────────────────────────────────────────────── */

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
