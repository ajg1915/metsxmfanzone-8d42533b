import { useEffect, useRef } from 'react';

export const useAutoRefresh = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Wait 3 seconds after mount before arming the listener so the initial
    // page load / tab-switch that opened the site doesn't trigger a reload.
    const initTimer = setTimeout(() => {
      initialized.current = true;
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && initialized.current) {
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
