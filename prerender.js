import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes to prerender - add all your static routes here
const routes = [
  '/',
  '/live',
  '/community',
  '/gallery',
  '/plans',
  '/auth',
  '/dashboard',
  '/blog',
  '/help-center',
  '/contact',
  '/feedback',
  '/faqs',
  '/privacy',
  '/terms',
  '/podcast',
  '/business-partner',
  '/sitemap',
  '/spring-training-live',
  '/merch',
  '/mlb-network',
  '/espn-network',
  '/metsxmfanzone',
];

async function prerender() {
  const template = fs.readFileSync(
    path.resolve(__dirname, 'dist/client/index.html'),
    'utf-8'
  );
  
  const { render } = await import('./dist/server/entry-server.js');
  
  for (const route of routes) {
    try {
      const { html, helmetContext } = render(route);
      
      // Extract helmet data
      const { helmet } = helmetContext;
      let finalHtml = template;
      
      // Inject helmet tags if available
      if (helmet) {
        const headTags = `
          ${helmet.title?.toString() || ''}
          ${helmet.meta?.toString() || ''}
          ${helmet.link?.toString() || ''}
        `.trim();
        
        finalHtml = finalHtml.replace('</head>', `${headTags}</head>`);
      }
      
      // Inject the rendered app HTML
      finalHtml = finalHtml.replace('<!--app-html-->', html);
      
      // Determine file path
      const filePath = route === '/' 
        ? path.resolve(__dirname, 'dist/client/index.html')
        : path.resolve(__dirname, `dist/client${route}/index.html`);
      
      // Create directory if needed
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the prerendered HTML
      fs.writeFileSync(filePath, finalHtml);
      console.log(`✓ Prerendered ${route}`);
    } catch (error) {
      console.error(`✗ Failed to prerender ${route}:`, error.message);
    }
  }
  
  console.log('\n✓ Prerendering complete!');
}

prerender().catch((error) => {
  console.error('Prerendering failed:', error);
  process.exit(1);
});
