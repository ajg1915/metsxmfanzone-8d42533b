import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Social media crawler user agents
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'DiscordBot',
  'pinterest',
  'redditbot'
];

function isCrawler(userAgent: string): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(bot => lowerUA.includes(bot.toLowerCase()));
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    const userAgent = req.headers.get('user-agent') || '';

    console.log('Request from:', userAgent);
    console.log('Is crawler:', isCrawler(userAgent));
    console.log('Slug:', slug);

    // Only process for crawlers with a slug
    if (!slug || !isCrawler(userAgent)) {
      return new Response(
        JSON.stringify({ 
          isCrawler: isCrawler(userAgent),
          message: 'Not a crawler request or missing slug' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch blog post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !post) {
      console.error('Error fetching post:', error);
      return new Response('Post not found', { status: 404 });
    }

    console.log('Found post:', post.title);

    // Get the site URL
    const siteUrl = 'https://www.metsxmfanzone.com';
    const postUrl = `${siteUrl}/blog/${slug}`;
    
    // Handle featured image (avoid base64)
    let socialImage = post.featured_image_url || `${siteUrl}/logo-512.png`;
    if (socialImage.startsWith('data:')) {
      socialImage = `${siteUrl}/logo-512.png`;
    } else if (!socialImage.startsWith('http')) {
      socialImage = `${siteUrl}${socialImage}`;
    }

    const socialTitle = `${post.title} | MetsXMFanZone`;
    const socialDescription = post.excerpt && post.excerpt.length > 0
      ? (post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + '...' : post.excerpt)
      : post.title;

    // Generate pre-rendered HTML for crawlers
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${socialTitle}</title>
  <meta name="description" content="${socialDescription}">
  
  <!-- Facebook App ID -->
  <meta property="fb:app_id" content="1151558476948104">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${postUrl}">
  <meta property="og:site_name" content="MetsXMFanZone">
  <meta property="og:title" content="${socialTitle}">
  <meta property="og:description" content="${socialDescription}">
  <meta property="og:image" content="${socialImage}">
  <meta property="og:image:secure_url" content="${socialImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${post.title}">
  <meta property="og:locale" content="en_US">
  
  <!-- Article tags -->
  <meta property="article:published_time" content="${post.published_at}">
  <meta property="article:section" content="${post.category}">
  <meta property="article:author" content="MetsXMFanZone">
  ${post.tags?.map((tag: string) => `<meta property="article:tag" content="${tag}">`).join('\n  ')}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@metsxmfanzone">
  <meta name="twitter:url" content="${postUrl}">
  <meta name="twitter:title" content="${socialTitle}">
  <meta name="twitter:description" content="${socialDescription}">
  <meta name="twitter:image" content="${socialImage}">
  <meta name="twitter:image:alt" content="${post.title}">
  
  <meta http-equiv="refresh" content="0;url=${postUrl}">
</head>
<body>
  <h1>${post.title}</h1>
  <p>${socialDescription}</p>
  <p>Redirecting to <a href="${postUrl}">${postUrl}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Error:', error);
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
