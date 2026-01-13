import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/assets/metsxmfanzone-logo.png";
import GlassCard from "@/components/GlassCard";

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
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, category, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const highlightPost = posts[0];
  const otherPosts = posts.slice(1);

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
      <section className="py-10 sm:py-12 md:py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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
    <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl glass-card">
              <img src={logo} alt="MetsXMFanZone" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Latest News
              </h2>
              <p className="text-sm text-muted-foreground">Stay updated with MetsXMFanZone</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/whats-new")} 
              className="group glass-card border-primary/50 bg-primary/10 hover:bg-primary/20 transition-all duration-300"
            >
              <img src={logo} alt="" className="w-4 h-4 object-contain" />
              What's New
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/blog")} 
              className="group glass-card border-border/30 hover:border-primary/50 transition-all duration-300"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
        
        {/* Highlight Post */}
        {highlightPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <GlassCard
              variant="interactive"
              glow="blue"
              className="cursor-pointer overflow-hidden"
            >
              <article
                onClick={() => navigate(`/blog/${highlightPost.slug}`)}
                className="grid md:grid-cols-2 gap-0"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[280px] overflow-hidden">
                  {highlightPost.featured_image_url ? (
                    <img
                      src={highlightPost.featured_image_url}
                      alt={highlightPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent md:hidden" />
                  
                  {/* Highlight Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className="text-xs px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </Badge>
                    <Badge className="text-xs px-2.5 py-1 bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm shadow-lg">
                      {highlightPost.category}
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground hover:text-primary transition-colors duration-300 line-clamp-3 leading-tight mb-3">
                    {highlightPost.title}
                  </h3>
                  
                  {highlightPost.excerpt && (
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {highlightPost.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/20">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(highlightPost.published_at)}</span>
                    </div>
                    <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read full story
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            </GlassCard>
          </motion.div>
        )}
        
        {/* Other Posts Grid */}
        {otherPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {otherPosts.map((post, index) => (
              <GlassCard
                key={post.id}
                variant="interactive"
                glow="blue"
                delay={index * 0.1}
                className="cursor-pointer"
              >
                <article
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
                    
                    <h3 className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
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
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
