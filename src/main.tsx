import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('[App] Service Worker registered:', registration.scope);
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
    }
  });
}

const rootElement = document.getElementById("root")!;

// Check if we're in production and the HTML has been prerendered
const isPrerendered = rootElement.innerHTML.trim().length > 0 && 
                      !rootElement.innerHTML.includes('<!--app-html-->');

if (isPrerendered && import.meta.env.PROD) {
  // Hydrate prerendered content in production
  hydrateRoot(
    rootElement,
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  );
} else {
  // Regular render in development or if not prerendered
  createRoot(rootElement).render(
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  );
}
