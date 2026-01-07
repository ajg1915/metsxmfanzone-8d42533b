import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response('Missing slug parameter', { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image_url, category, tags, published_at')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !post) {
      return new Response('Post not found', { status: 404, headers: corsHeaders });
    }

    const siteUrl = 'https://metsxmfanzone.com';
    const postUrl = `${siteUrl}/blog/${slug}`;
    
    // Ensure proper absolute image URL
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

    const publishedTime = post.published_at || new Date().toISOString();
    const tagsMetaTags = (post.tags || []).map((tag: string) => 
      `<meta property="article:tag" content="${tag}" />`
    ).join('\n    ');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${socialTitle}</title>
    <meta name="description" content="${socialDescription}">
    
    <!-- Facebook App ID -->
    <meta property="fb:app_id" content="1151558476948104" />
    
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
    
    <!-- Article metadata -->
    <meta property="article:published_time" content="${publishedTime}">
    <meta property="article:modified_time" content="${publishedTime}">
    <meta property="article:section" content="${post.category}">
    <meta property="article:author" content="MetsXMFanZone">
    ${tagsMetaTags}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@metsxmfanzone">
    <meta name="twitter:creator" content="@metsxmfanzone">
    <meta name="twitter:url" content="${postUrl}">
    <meta name="twitter:title" content="${socialTitle}">
    <meta name="twitter:description" content="${socialDescription}">
    <meta name="twitter:image" content="${socialImage}">
    <meta name="twitter:image:alt" content="${post.title}">
    
    <!-- LinkedIn -->
    <meta property="og:image:type" content="image/jpeg">
    
    <!-- Facebook Instant Articles -->
    <meta property="ia:markup_url" content="${postUrl}">
    <meta property="ia:markup_url_dev" content="${postUrl}">
    
    <!-- Canonical -->
    <link rel="canonical" href="${postUrl}">
    
    <!-- Redirect to actual blog post -->
    <meta http-equiv="refresh" content="0;url=${postUrl}">
    <script>
      window.location.href = "${postUrl}";
    </script>
</head>
<body>
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; text-align: center;">
        <h1 style="color: #333; margin-bottom: 20px;">${post.title}</h1>
        ${post.featured_image_url && !post.featured_image_url.startsWith('data:') ? 
          `<img src="${socialImage}" alt="${post.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">` : 
          ''}
        <p style="color: #666; font-size: 18px; line-height: 1.6;">${socialDescription}</p>
        <p style="color: #999; margin-top: 20px;">Redirecting to article...</p>
        <noscript>
            <a href="${postUrl}" style="color: #0066cc; text-decoration: none; font-weight: bold;">Click here if you are not redirected</a>
        </noscript>
    </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    });
  } catch (error) {
    console.error('Error generating meta tags:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
