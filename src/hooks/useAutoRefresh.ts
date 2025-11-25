import { useEffect } from 'react';

export const useAutoRefresh = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;

      // Reload page when new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('New version detected, reloading...');
        window.location.reload();
      });

      // Check for updates every 30 seconds
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      };

      // Check immediately on mount
      checkForUpdates();

      // Check every 30 seconds
      const interval = setInterval(checkForUpdates, 30000);

      return () => clearInterval(interval);
    }
  }, []);
};
