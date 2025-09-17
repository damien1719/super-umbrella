import type { ReactNode } from 'react';

interface ReadOnlyOverlayProps {
  active: boolean;
  children: ReactNode;
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export default function ReadOnlyOverlay({
  active,
  children,
  message = 'Trame en lecture seule',
  ctaLabel = 'Dupliquer la trame',
  onCta,
  className = '',
}: ReadOnlyOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden={active}
        className={active ? 'pointer-events-none select-none opacity-90' : ''}
      >
        {children}
      </div>
      {active && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/20 backdrop-blur-[0.01rem]">
           <div className="flex items-center gap-3 rounded border border-gray-300 bg-white/80 px-3 py-2 text-sm text-gray-800 shadow">
            <span className="font-medium">{message}</span>
            {onCta && (
              <button
                type="button"
                className="inline-flex items-center rounded bg-primary-600 px-2.5 py-1.5 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={onCta}
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

