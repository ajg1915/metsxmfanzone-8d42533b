import { useEffect } from 'react';

export const useAutoRefresh = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for service worker updates every minute
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      };

      // Check immediately
      checkForUpdates();

      // Check every 60 seconds
      const interval = setInterval(checkForUpdates, 60000);

      // Listen for updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New version available, will refresh on next visit');
        sessionStorage.setItem('needsRefresh', 'true');
      });

      return () => clearInterval(interval);
    }
  }, []);
};
