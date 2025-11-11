import ReactDOMServer from 'react-dom/server';
// @ts-ignore - StaticRouter exists but types may not be resolved in build
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

export function render(url: string) {
  const html = ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StaticRouter>
  );
  
  return html;
}
