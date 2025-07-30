import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current viewport is considered mobile.
 * Uses window.innerWidth and listens to resize events.
 * @param breakpoint The maximum width (in pixels) to consider as mobile. Defaults to 768.
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  // Initialize state based on current window width (handles SSR by defaulting to false)
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler once to set initial state
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
