import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
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
const BlogSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPosts();
  }, []);
  const fetchPosts = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("blog_posts").select("id, title, slug, excerpt, featured_image_url, category, published_at").eq("published", true).order("published_at", {
        ascending: false
      }).limit(3);
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
    return <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading latest posts...</div>
        </div>
      </section>;
  }
  if (posts.length === 0) {
    return null;
  }
  return <section className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="sm:text-xl font-bold text-lg">MetsXMFanZone Latest News</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/blog")} className="w-full sm:w-auto">
            View All Posts
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {posts.map(post => <Card key={post.id} className="border-2 border-primary bg-card overflow-hidden hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate(`/blog/${post.slug}`)}>
              {post.featured_image_url && <div className="aspect-[16/9] overflow-hidden">
                  <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>}
              <CardHeader className="p-3 sm:p-4">
                <Badge className="w-fit mb-2 text-xs px-2 py-1 bg-primary text-primary-foreground">
                  {post.category}
                </Badge>
                <h3 className="text-sm sm:text-base font-bold text-primary group-hover:text-primary/80 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                {post.excerpt && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {post.excerpt}
                  </p>}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {getTimeAgo(post.published_at)}
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default BlogSection;