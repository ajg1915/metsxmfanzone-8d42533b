import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url?: string;
  category: string;
  published_at: string;
}

interface BlogSectionProps {
  className?: string;
}

const BlogSection = ({ className }: BlogSectionProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, category, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <section className={`py-12 sm:py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading latest posts...
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 sm:py-16 relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Latest News
              </h2>
              <p className="text-sm text-muted-foreground">Stay updated with MetsXMFanZone</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/blog")} 
            className="group border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/30 hover:border-primary/40 transition-all duration-500 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              {/* Image Container */}
              {post.featured_image_url && (
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-80" />
                  
                  {/* Category Badge - Floating */}
                  <Badge className="absolute top-3 left-3 text-xs px-2.5 py-1 bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm shadow-lg">
                    {post.category}
                  </Badge>
                </div>
              )}
              
              {/* Content */}
              <div className="p-4 sm:p-5 space-y-3">
                {!post.featured_image_url && (
                  <Badge className="text-xs px-2.5 py-1 bg-primary/10 text-primary border border-primary/20">
                    {post.category}
                  </Badge>
                )}
                
                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getTimeAgo(post.published_at)}</span>
                  </div>
                  <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                    Read more
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;