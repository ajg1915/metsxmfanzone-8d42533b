import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Register service worker for push notifications and offline caching
// NOTE: the Lovable preview environment can be unstable with a Service Worker enabled
// (cached JS/CSS can get out of sync during rapid iterations). We disable + fully clean SW
// on preview hosts to prevent the "Sorry, we ran into an issue starting the live preview" modal.
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.endsWith(".lovableproject.com") ||
  window.location.hostname === "lovableproject.com";

const PREVIEW_SW_CLEAN_KEY = "__preview_sw_cleaned_v1";

const cleanupPreviewServiceWorker = async () => {
  try {
    // Prevent reload loops
    const alreadyCleaned = sessionStorage.getItem(PREVIEW_SW_CLEAN_KEY) === "1";

    const hadSW = "serviceWorker" in navigator;
    const hadCaches = "caches" in window;

    let unregisteredCount = 0;
    if (hadSW) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        regs.map(async (r) => {
          const ok = await r.unregister();
          if (ok) unregisteredCount += 1;
        })
      );
    }

    let deletedCacheCount = 0;
    if (hadCaches) {
      const keys = await caches.keys();
      deletedCacheCount = keys.length;
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    console.warn("[App] Preview SW cleanup", {
      unregisteredCount,
      deletedCacheCount,
    });

    // If anything was cleaned and we haven't reloaded yet, reload once to fetch fresh assets.
    if (!alreadyCleaned && (unregisteredCount > 0 || deletedCacheCount > 0)) {
      sessionStorage.setItem(PREVIEW_SW_CLEAN_KEY, "1");
      window.location.reload();
    }
  } catch (e) {
    console.warn("[App] Preview SW cleanup failed", e);
  }
};

if (isPreviewHost) {
  // Run immediately (not on window load) so we can escape stale cached assets ASAP.
  void cleanupPreviewServiceWorker();
} else {
  // VitePWA handles service worker registration automatically via registerType: "autoUpdate"
  // No manual registration needed
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id='root' in your HTML.");
}

// Clear any placeholder content and render the app
rootElement.innerHTML = '';

createRoot(rootElement).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
