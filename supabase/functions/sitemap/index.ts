import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all published blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const baseUrl = 'https://www.metsxmfanzone.com';
    
    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/live', changefreq: 'daily', priority: '0.9' },
      { url: '/community', changefreq: 'weekly', priority: '0.8' },
      { url: '/gallery', changefreq: 'weekly', priority: '0.7' },
      { url: '/plans', changefreq: 'monthly', priority: '0.8' },
      { url: '/blog', changefreq: 'daily', priority: '0.8' },
      { url: '/podcast', changefreq: 'weekly', priority: '0.8' },
      { url: '/help-center', changefreq: 'monthly', priority: '0.6' },
      { url: '/contact', changefreq: 'monthly', priority: '0.7' },
      { url: '/feedback', changefreq: 'monthly', priority: '0.6' },
      { url: '/faqs', changefreq: 'monthly', priority: '0.6' },
      { url: '/privacy', changefreq: 'yearly', priority: '0.3' },
      { url: '/terms', changefreq: 'yearly', priority: '0.3' },
      { url: '/business-partner', changefreq: 'monthly', priority: '0.5' },
      { url: '/metsxmfanzone-tv', changefreq: 'weekly', priority: '0.8' },
      { url: '/mlb-network', changefreq: 'weekly', priority: '0.8' },
    ];

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add dynamic blog posts
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${post.published_at?.split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += '  </url>\n';
      });
    }

    xml += '</urlset>';

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
