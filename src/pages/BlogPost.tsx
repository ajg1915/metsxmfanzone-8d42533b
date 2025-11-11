import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, ArrowLeft, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SocialShareButtons from "@/components/SocialShareButtons";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url?: string;
  category: string;
  tags: string[];
  published_at: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isLoggedIn = !!user;

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      
      // Ensure featured image URL is absolute for social sharing
      if (data.featured_image_url && !data.featured_image_url.startsWith('http')) {
        // If it's a relative URL, make it absolute
        data.featured_image_url = `${window.location.origin}${data.featured_image_url}`;
      }
      
      setPost(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Post not found</p>
              <Button onClick={() => navigate("/blog")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentUrl = window.location.href;
  const siteUrl = window.location.origin;
  
  // Ensure we have a proper image for social sharing (not base64)
  let socialImage = post.featured_image_url || `${siteUrl}/logo-512.png`;
  
  // Check if image is base64 (won't work for social media)
  if (socialImage.startsWith('data:')) {
    console.warn('Blog post has base64 image which won\'t work for social sharing:', post.slug);
    socialImage = `${siteUrl}/logo-512.png`; // Fallback to site logo
  }
  
  const socialTitle = `${post.title} | MetsXMFanZone`;
  const socialDescription = post.excerpt && post.excerpt.length > 0
    ? (post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + '...' : post.excerpt)
    : post.title;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/95">
      <Helmet>
        <title>{socialTitle}</title>
        <meta name="description" content={socialDescription} />
        
        {/* Facebook App ID */}
        <meta property="fb:app_id" content="1151558476948104" />
        
        {/* Essential Open Graph tags for Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="MetsXMFanZone" />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={socialDescription} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:secure_url" content={socialImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={post.title} />
        <meta property="og:locale" content="en_US" />
        
        {/* Article specific tags */}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:modified_time" content={post.published_at} />
        <meta property="article:section" content={post.category} />
        <meta property="article:author" content="MetsXMFanZone" />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@metsxmfanzone" />
        <meta name="twitter:creator" content="@metsxmfanzone" />
        <meta name="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={socialDescription} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={post.title} />
        
        {/* Facebook Instant Articles */}
        <meta property="ia:markup_url" content={currentUrl} />
        <meta property="ia:markup_url_dev" content={currentUrl} />
        <meta property="ia:rules_url" content={`${siteUrl}/rules.json`} />
        <meta property="ia:rules_url_dev" content={`${siteUrl}/rules.json`} />
        
        {/* Additional Meta Tags */}
        <meta name="author" content="MetsXMFanZone" />
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto w-full">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate("/blog")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>

          <article>
            {post.featured_image_url && (
              <div className="aspect-video overflow-hidden rounded-lg mb-6">
                <img 
                  src={post.featured_image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <header className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {post.category}
                </span>
              </div>

              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-sm bg-muted px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {!isLoggedIn ? (
              <Card className="border-2 border-primary">
                <CardContent className="py-12 text-center">
                  <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Account Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Sign up for free to read full blog posts and access exclusive content
                  </p>
                  <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
                    Sign Up Free
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="prose prose-lg max-w-none dark:prose-invert py-8">
                  <div className="whitespace-pre-wrap">{post.content}</div>
                </CardContent>
              </Card>
            )}

            <div className="mt-8">
              <Card>
                <CardContent className="py-6">
                  <SocialShareButtons title={post.title} url={window.location.href} />
                </CardContent>
              </Card>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
