import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Register service worker for push notifications and offline caching
// NOTE: the Lovable preview environment can be unstable with a Service Worker enabled
// (cached JS/CSS can get out of sync during rapid iterations). We disable + unregister SW
// on preview hosts to prevent the "Lovable ran into an issue" preview screen.
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.endsWith(".lovableproject.com") ||
  window.location.hostname === "lovableproject.com";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      if (isPreviewHost) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        console.warn("[App] Service Worker disabled in preview environment");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("[App] Service Worker registered:", registration.scope);

      // No periodic update checks - let natural navigation handle updates
      // This prevents constant refreshing while still maintaining push notification support
    } catch (error) {
      console.error("[App] Service Worker registration failed:", error);
    }
  });
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
