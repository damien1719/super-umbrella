import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean | 'icon';
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible, ...props }, ref) => (
    <div
      ref={ref}
      data-collapsible={
        typeof collapsible !== 'undefined' ? collapsible : undefined
      }
      className={cn(
        'flex min-h-screen w-60 flex-col border-r bg-gray-100',
        className,
      )}
      {...props}
    />
  ),
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex h-14 items-center border-b', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto p-2', className)}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('mt-auto p-2 border-t', className)} {...props} />
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pb-2', className)} {...props} />
));
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-1', className)} {...props} />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('grid items-start gap-1', className)}
    {...props}
  />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('w-full', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size?: 'lg' | 'default';
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, size = 'default', ...props }, ref) => (
  <button
    ref={ref}
    data-active={isActive}
    className={cn(
      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700',
      size === 'lg' && 'px-2 py-2',
      isActive && 'bg-blue-50 text-blue-700',
      className,
    )}
    {...props}
  />
));
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarRail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('hidden', className)} {...props} />
));
SidebarRail.displayName = 'SidebarRail';

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
};
