import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Static routes to prerender
const staticRoutes = [
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

async function fetchBlogPostSlugs() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('published', true);
    
    if (error) throw error;
    
    return data ? data.map(post => `/blog/${post.slug}`) : [];
  } catch (error) {
    console.error('❌ Error fetching blog post slugs:', error.message);
    return [];
  }
}

async function prerender() {
  // Fetch all blog post slugs
  console.log('📚 Fetching blog post slugs...');
  const blogRoutes = await fetchBlogPostSlugs();
  console.log(`✓ Found ${blogRoutes.length} blog posts to prerender`);
  
  // Combine static routes with dynamic blog routes
  const routes = [...staticRoutes, ...blogRoutes];
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
