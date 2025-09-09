import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ChipOutlineProps {
  titles: string[];
}

// Small sticky horizontal outline used above the form to navigate
// between question groups inside DataEntry (which renders sections
// with wrappers tagged with data-idx and a root container with id
// "dataentry-scroll-root").
export default function InlineGroupChips({ titles }: ChipOutlineProps) {
  const [active, setActive] = useState(0);
  const obsRef = useRef<IntersectionObserver | null>(null);

  const indices = useMemo(() => titles.map((_, i) => i), [titles]);

  useEffect(() => {
    const root = document.getElementById('dataentry-scroll-root');
    // Always disconnect any previous observer
    obsRef.current?.disconnect();
    // If there's 0 or 1 title, don't setup an observer
    if (!root || titles.length <= 1) return;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>('[data-idx]'),
    );
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) {
          const idx = Number(first.target.getAttribute('data-idx'));
          if (!Number.isNaN(idx)) setActive(idx);
        }
      },
      {
        root,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.01,
      },
    );
    sections.forEach((el) => obs.observe(el));
    obsRef.current = obs;
    return () => obs.disconnect();
  }, [titles.length]);

  const scrollTo = (i: number) => {
    const root = document.getElementById('dataentry-scroll-root');
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-idx="${i}"]`);
    if (!el) return;
    // Force scrolling only within the DataEntry container
    const top =
      el.getBoundingClientRect().top -
      root.getBoundingClientRect().top +
      root.scrollTop;
    root.scrollTo({ top, behavior: 'smooth' });
  };

  if (titles.length <= 1) return null;

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-wood-200 py-2">
      <div className="flex items-center gap-2 overflow-x-auto px-1 no-scrollbar">
        {indices.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
              i === active
                ? 'bg-primary-50 text-primary-700 border-primary-200'
                : 'bg-white text-gray-700 border-wood-200 hover:bg-gray-50'
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                i === active
                  ? 'border-primary text-primary'
                  : 'border-wood-200 text-gray-500'
              } text-[11px]`}
            >
              {i + 1}
            </span>
            <span className="truncate max-w-[220px]">{titles[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
