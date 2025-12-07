import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;

// Check if we're in production and the HTML has been prerendered
// The placeholder <!--app-html--> should be replaced with actual content during prerendering
const htmlContent = rootElement.innerHTML.trim();
const isPrerendered = htmlContent.length > 0 && 
                      htmlContent !== '<!--app-html-->' &&
                      !htmlContent.includes('<!--app-html-->');

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
