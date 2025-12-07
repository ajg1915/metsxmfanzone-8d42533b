import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;

// Check if there's actual rendered content (not just comments or whitespace)
// Comments are stripped by the browser, so we check for actual element content
const hasRenderedContent = rootElement.children.length > 0 || 
  (rootElement.innerHTML.trim().length > 0 && rootElement.textContent?.trim().length !== 0);

const isPrerendered = hasRenderedContent && import.meta.env.PROD;

if (isPrerendered) {
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
