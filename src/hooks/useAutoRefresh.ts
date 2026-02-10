import { useEffect } from 'react';

export const useAutoRefresh = () => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    };

    // Only add listener after a short delay so the initial page load doesn't trigger it
    const timeout = setTimeout(() => {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
