import { useEffect, useRef, useState } from 'react';

export const usePullToRefresh = (onRefresh: () => void | Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const threshold = 80; // pixels to pull before refresh

  useEffect(() => {
    let isRefreshing = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && startY.current > 0) {
        const currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;

        if (distance > 0) {
          setIsPulling(true);
          setPullDistance(Math.min(distance, threshold * 1.5));
          
          // Prevent default scrolling when pulling
          if (distance > 10) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance >= threshold && !isRefreshing) {
        isRefreshing = true;
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          isRefreshing = false;
        }
      }

      setIsPulling(false);
      setPullDistance(0);
      startY.current = 0;
    };

    // Only add listeners on touch devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if ('ontouchstart' in window) {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isPulling, pullDistance, onRefresh]);

  return { isPulling, pullDistance, threshold };
};
