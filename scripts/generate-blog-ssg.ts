import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  category: string;
  tags: string[];
  published_at: string;
}

async function generateBlogSSG() {
  console.log('🚀 Generating static blog post HTML files...');

  // Fetch all published blog posts
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, featured_image_url, category, tags, published_at')
    .eq('published', true);

  if (error) {
    console.error('❌ Error fetching blog posts:', error);
    return;
  }

  const distPath = path.join(process.cwd(), 'dist', 'blog');
  
  // Create blog directory if it doesn't exist
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  const siteUrl = 'https://www.metsxmfanzone.com';

  for (const post of posts as BlogPost[]) {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    
    // Ensure proper image URL
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

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${socialTitle}</title>
  <meta name="description" content="${socialDescription}">
  
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
  <link rel="canonical" href="${postUrl}" />
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${socialDescription}",
    "image": "${socialImage}",
    "datePublished": "${post.published_at}",
    "author": {
      "@type": "Organization",
      "name": "MetsXMFanZone"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MetsXMFanZone",
      "logo": {
        "@type": "ImageObject",
        "url": "${siteUrl}/logo-512.png"
      }
    }
  }
  </script>
</head>
<body>
  <h1>${post.title}</h1>
  <p>${socialDescription}</p>
  <p>Redirecting to <a href="${postUrl}">${postUrl}</a>...</p>
</body>
</html>`;

    // Create post directory
    const postDir = path.join(distPath, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    // Write index.html
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
    console.log(`✅ Generated: /blog/${post.slug}/index.html`);
  }

  console.log(`🎉 Successfully generated ${posts.length} static blog post HTML files!`);
}

generateBlogSSG().catch(console.error);
