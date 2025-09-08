import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export interface OverflowItem {
  key: string;
  element: React.ReactNode;
}

interface OverflowToolbarProps {
  items: OverflowItem[];
  className?: string;
  moreLabel?: string;
}

// Simple, maintainable overflow toolbar. Measures item widths and moves
// trailing items into a “More” dropdown when space runs out.
export function OverflowToolbar({
  items,
  className,
  moreLabel = 'Plus',
}: OverflowToolbarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const moreMeasureRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const measureItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [visibleCount, setVisibleCount] = useState(items.length);

  // Reset visibleCount when items change
  useEffect(() => {
    setVisibleCount(items.length);
  }, [items.length]);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const available = container.clientWidth;

    // Compute full widths (including margins) for each item from hidden measure row
    const widths = measureItemRefs.current.slice(0, items.length).map((el) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const ml = parseFloat(style.marginLeft || '0') || 0;
      const mr = parseFloat(style.marginRight || '0') || 0;
      return rect.width + ml + mr;
    });

    const total = widths.reduce((a, b) => a + b, 0);
    const moreWidth = moreMeasureRef.current
      ? moreMeasureRef.current.getBoundingClientRect().width
      : 0;

    // If everything fits, show all
    if (total <= available) {
      setVisibleCount(items.length);
      return;
    }

    // Otherwise reserve space for the More button and find how many fit
    let used = 0;
    let fit = 0;
    for (let i = 0; i < widths.length; i++) {
      const remainingItems = widths.length - (i + 1);
      const reserve = remainingItems > 0 ? moreWidth : 0;
      if (used + widths[i] + reserve <= available) {
        used += widths[i];
        fit = i + 1;
      } else {
        break;
      }
    }
    setVisibleCount(fit);
  }, [items.length]);

  // Re-measure on mount and on resize
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => measure());
    const el = containerRef.current;
    if (el) ro.observe(el);
    // Also listen to window resize to capture font loading/layout shifts
    window.addEventListener('resize', measure);
    // Initial measure after paint
    const raf = requestAnimationFrame(() => measure());
    return () => {
      if (el) ro.unobserve(el);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  const overflow = items.slice(visibleCount);

  return (
    <div ref={containerRef} className={(className || '') + ' relative'}>
      {/* Visible items */}
      <div className="flex items-center space-x-2 overflow-hidden">
        {items.slice(0, visibleCount).map((it, idx) => (
          <div
            key={it.key}
            ref={(node) => (itemRefs.current[idx] = node)}
            className="flex-shrink-0"
          >
            {it.element}
          </div>
        ))}

        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="editor" aria-label={moreLabel}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 min-w-[12rem] bg-white border border-wood-200 shadow-sm">
              <div className="flex flex-col space-y-2">
                {overflow.map((it) => (
                  <div key={it.key} className="flex-shrink-0">
                    {it.element}
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Invisible More button to measure width accurately */}
        <Button
          ref={moreMeasureRef}
          type="button"
          variant="editor"
          className="absolute opacity-0 pointer-events-none -z-10"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      {/* Hidden measurement row: always render all items for accurate widths */}
      <div className="absolute top-0 left-0 h-0 overflow-hidden invisible pointer-events-none -z-10">
        <div className="flex items-center space-x-2">
          {items.map((it, idx) => (
            <div
              key={`measure-${it.key}`}
              ref={(node) => (measureItemRefs.current[idx] = node)}
              className="flex-shrink-0"
            >
              {it.element}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OverflowToolbar;
