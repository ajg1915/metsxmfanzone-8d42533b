import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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
