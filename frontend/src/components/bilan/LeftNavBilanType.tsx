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
  const INITIAL_WIDTH = 240; // Tailwind w-60 => 15rem => ~240px
  const MAX_WIDTH = INITIAL_WIDTH * 2; // up to 2x the current size
  const [width, setWidth] = React.useState<number>(INITIAL_WIDTH);
  const startXRef = React.useRef<number>(0);
  const startWidthRef = React.useRef<number>(INITIAL_WIDTH);
  const isDraggingRef = React.useRef<boolean>(false);

  const onMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    let next = startWidthRef.current + dx;
    if (next < INITIAL_WIDTH) next = INITIAL_WIDTH;
    if (next > MAX_WIDTH) next = MAX_WIDTH;
    setWidth(next);
  }, []);

  const stopDragging = React.useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', stopDragging);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [onMouseMove]);

  const startDragging = React.useCallback(
    (e: React.MouseEvent) => {
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    },
    [onMouseMove, stopDragging, width],
  );

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [onMouseMove, stopDragging]);

  return (
    <aside
      className="hidden md:flex shrink-0 border-r border-wood-200 bg-white sticky top-0 h-[calc(100vh-120px)] relative select-none"
      style={{ width }}
    >
      <div className="flex flex-col w-full">
        <div className="px-2 py-2 text-sm text-muted-foreground">
          Sections ({items.filter((i) => i.kind !== 'separator').length})
        </div>
        <nav className="flex-1 overflow-y-auto">
          {items.map((it, i) => {
            if (it.kind === 'separator') {
              // Compute the group (all sections until next separator)
              const nextSeparatorIndex = items.findIndex(
                (x, idx) => idx > i && x.kind === 'separator',
              );
              const group = items
                .slice(
                  i + 1,
                  nextSeparatorIndex === -1 ? items.length : nextSeparatorIndex,
                )
                .filter((x) => x.kind !== 'separator');
              const allHidden =
                group.length > 0 && group.every((x) => (x as any).disabled);
              const someVisible = group.some((x) => !(x as any).disabled);
              return (
                <div
                  key={it.id}
                  className="px-2 py-2 mt-2 text-[11px] uppercase tracking-wide text-gray-500 border-t border-wood-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{it.title}</span>
                    {onToggleDisabled && group.length > 0 && (
                      <button
                        type="button"
                        className="ml-2 p-1 rounded hover:bg-gray-100 text-gray-500"
                        title={
                          allHidden
                            ? 'Afficher toutes les sections du groupe'
                            : 'Masquer toutes les sections du groupe'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          // If any section is visible, hide all. Else, show all.
                          const shouldHideAll = someVisible;
                          for (const s of group as Array<
                            LeftNavItem & { disabled?: boolean }
                          >) {
                            if (shouldHideAll && !s.disabled) {
                              onToggleDisabled?.(s.id);
                            } else if (!shouldHideAll && s.disabled) {
                              onToggleDisabled?.(s.id);
                            }
                          }
                        }}
                      >
                        {allHidden ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            }
            const active = it.id === activeId;
            return (
              <button
                key={it.id}
                onClick={() => onSelect(it.id)}
                className={cn(
                  'group relative w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
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
      {/* Drag handle to resize horizontally (max 2x) */}
      <div
        role="separator"
        aria-orientation="vertical"
        title="Agrandir le panneau"
        onMouseDown={startDragging}
        className="absolute right-0 top-0 h-full w-1 cursor-ew-resize"
      >
        {/* Visual affordance on hover */}
        <div className="h-full w-full bg-transparent hover:bg-primary-200/50 transition-colors" />
      </div>
    </aside>
  );
}

export default LeftNavBilanType;
