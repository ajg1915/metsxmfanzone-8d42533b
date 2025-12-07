import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
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
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <section className={`py-8 bg-gradient-to-b from-secondary/20 to-background ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">Loading latest posts...</div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 sm:py-10 bg-gradient-to-b from-secondary/20 to-background ${className}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h2 className="text-lg sm:text-xl font-bold gradient-text">MetsXMFanZone Latest News</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/blog")} 
            className="w-full sm:w-auto border-secondary hover:bg-secondary hover:border-mets-blue-light"
          >
            View All Posts
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {posts.map((post, index) => (
            <Card 
              key={post.id} 
              className="border border-border/50 bg-gradient-to-br from-card to-secondary/20 overflow-hidden hover-glow transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/blog/${post.slug}`)}
            >
              {post.featured_image_url && (
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={post.featured_image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
              )}
              <CardHeader className="p-3 sm:p-4 relative">
                <Badge className="w-fit mb-2 text-xs px-2 py-1 bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  {post.category}
                </Badge>
                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 text-secondary" />
                  {getTimeAgo(post.published_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
