import { useEffect } from 'react';

export const useAutoRefresh = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;

      // Reload page only when new service worker takes control (new content detected)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('New version detected, reloading...');
        window.location.reload();
      });

      // No interval-based checking - only refresh on actual SW updates
    }
  }, []);
};
