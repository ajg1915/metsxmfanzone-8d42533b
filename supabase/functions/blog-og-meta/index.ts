import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://www.metsxmfanzone.com";

const escapeHtml = (input: string) =>
  input.replace(/[&<>"']/g, (m) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m] || m)
  );

const stripHtml = (input: string) =>
  input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, content, featured_image_url, category, tags, published_at"
      )
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !post) {
      return new Response("Post not found", { status: 404, headers: corsHeaders });
    }

    const postUrl = `${SITE_URL}/blog/${slug}`;

    // Ensure proper absolute image URL (avoid base64)
    let socialImage = post.featured_image_url || `${SITE_URL}/logo-512.png`;
    if (socialImage.startsWith("data:")) {
      socialImage = `${SITE_URL}/logo-512.png`;
    } else if (!socialImage.startsWith("http")) {
      socialImage = `${SITE_URL}${socialImage}`;
    }

    const socialTitle = `${post.title} | MetsXMFanZone`;

    const rawDescription =
      (post.excerpt && post.excerpt.trim().length > 0
        ? post.excerpt
        : stripHtml(post.content || "")) || post.title;

    const socialDescription =
      rawDescription.length > 160
        ? rawDescription.substring(0, 157) + "..."
        : rawDescription;

    const publishedTime = post.published_at || new Date().toISOString();

    const tagsMetaTags = (post.tags || [])
      .map((tag: string) =>
        `<meta property="article:tag" content="${escapeHtml(tag)}" />`
      )
      .join("\n    ");

    // Escape values for HTML/meta attributes (prevents broken tags + improves scraper reliability)
    const safeTitleAttr = escapeHtml(socialTitle);
    const safeDescriptionAttr = escapeHtml(socialDescription);
    const safePostTitleAttr = escapeHtml(post.title);
    const safeCategoryAttr = escapeHtml(post.category || "");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(socialTitle)}</title>
    <meta name="description" content="${safeDescriptionAttr}">

    <!-- Facebook App ID -->
    <meta property="fb:app_id" content="1151558476948104" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:site_name" content="MetsXMFanZone">
    <meta property="og:title" content="${safeTitleAttr}">
    <meta property="og:description" content="${safeDescriptionAttr}">
    <meta property="og:image" content="${socialImage}">
    <meta property="og:image:secure_url" content="${socialImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${safePostTitleAttr}">
    <meta property="og:locale" content="en_US">

    <!-- Article metadata -->
    <meta property="article:published_time" content="${publishedTime}">
    <meta property="article:modified_time" content="${publishedTime}">
    <meta property="article:section" content="${safeCategoryAttr}">
    <meta property="article:author" content="MetsXMFanZone">
    ${tagsMetaTags}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@metsxmfanzone">
    <meta name="twitter:creator" content="@metsxmfanzone">
    <meta name="twitter:url" content="${postUrl}">
    <meta name="twitter:title" content="${safeTitleAttr}">
    <meta name="twitter:description" content="${safeDescriptionAttr}">
    <meta name="twitter:image" content="${socialImage}">
    <meta name="twitter:image:alt" content="${safePostTitleAttr}">

    <!-- Canonical -->
    <link rel="canonical" href="${postUrl}">

    <!-- Redirect to actual blog post -->
    <meta http-equiv="refresh" content="0;url=${postUrl}">
    <script>window.location.href = ${JSON.stringify(postUrl)};</script>
</head>
<body>
    <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; text-align: center;">
        <h1 style="margin-bottom: 16px;">${escapeHtml(post.title)}</h1>
        <p style="color: #666; font-size: 18px; line-height: 1.6;">${escapeHtml(socialDescription)}</p>
        <p style="color: #999; margin-top: 20px;">Redirecting…</p>
        <noscript>
            <a href="${postUrl}">Click here if you are not redirected</a>
        </noscript>
    </div>
</body>
</html>`;

    const headers = new Headers(corsHeaders);
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=3600, s-maxage=7200");

    return new Response(html, { headers });
  } catch (error) {
    console.error("Error generating meta tags:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    const headers = new Headers(corsHeaders);
    headers.set("content-type", "application/json; charset=utf-8");

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers,
    });
  }
});
