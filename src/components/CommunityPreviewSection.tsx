import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, ArrowRight, Heart, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
  isAdmin?: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  featured_image_url: string | null;
  published_at: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

const CommunityPreviewSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postsCount: 0, membersCount: 0 });

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch admin user IDs
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      
      const adminUserIds = new Set((adminRoles || []).map(r => r.user_id));

      // Fetch latest posts
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          content,
          image_url,
          created_at,
          profiles (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      // Fetch recent blog posts
      const { data: blogData } = await supabase
        .from("blog_posts")
        .select(`
          id,
          title,
          excerpt,
          slug,
          featured_image_url,
          published_at,
          profiles (
            full_name
          )
        `)
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(2);

      // Get counts
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });

      const { count: membersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Generate signed URLs for images
      const postsWithSignedUrls = await Promise.all(
        (postsData || []).map(async (post) => {
          let imageUrl = post.image_url;
          if (post.image_url) {
            const fileName = post.image_url.split('/community_images/')[1] || post.image_url;
            if (fileName) {
              const { data: signedUrlData } = await supabase.storage
                .from('community_images')
                .createSignedUrl(fileName, 3600);
              imageUrl = signedUrlData?.signedUrl || post.image_url;
            }
          }
          return {
            ...post,
            image_url: imageUrl,
            isAdmin: adminUserIds.has(post.user_id)
          };
        })
      );

      setPosts(postsWithSignedUrls);
      setRecentBlogs(blogData || []);
      setStats({
        postsCount: postsCount || 0,
        membersCount: membersCount || 0
      });
    } catch (error) {
      console.error("Error fetching community data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-48 bg-muted rounded-xl" />
              <div className="h-48 bg-muted rounded-xl" />
              <div className="h-48 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 md:py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              Fan Community
            </h2>
            <p className="text-muted-foreground mt-1">
              Join the conversation with {stats.membersCount.toLocaleString()}+ Mets fans
            </p>
          </div>
          <Button 
            onClick={() => navigate("/community")}
            className="group"
          >
            Join Community
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary px-4 py-2">
            <MessageSquare className="w-4 h-4 mr-2" />
            {stats.postsCount.toLocaleString()} Posts
          </Badge>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {stats.membersCount.toLocaleString()} Members
          </Badge>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recent Posts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate("/community")}
                    className="cursor-pointer group glass-card hover-lift glow-blue rounded-lg overflow-hidden"
                  >
                    <div className="flex gap-3 p-2.5">
                      {/* Thumbnail - same size as Latest News */}
                      {post.image_url ? (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img 
                            src={post.image_url} 
                            alt="Post" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {post.isAdmin ? "A" : (post.profiles?.full_name?.[0] || "U")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground text-sm">
                              {post.isAdmin ? "Admin" : (post.profiles?.full_name?.split(' ')[0] || "Fan")}
                            </span>
                          </div>
                          {post.content && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                              {post.content}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <Card className="col-span-full bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Be the first to post!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Blog Posts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Latest Articles
            </h3>
            <div className="space-y-3">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                    className="cursor-pointer group glass-card hover-lift glow-blue rounded-lg overflow-hidden"
                  >
                    <div className="flex gap-3 p-2.5">
                      {/* Thumbnail - same size as other sections */}
                      {blog.featured_image_url ? (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img 
                            src={blog.featured_image_url} 
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary/50" />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 mb-1 bg-muted text-muted-foreground border-0">
                            Blog
                          </Badge>
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {blog.title}
                          </h4>
                        </div>
                        {blog.published_at && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                            <FileText className="w-3 h-3" />
                            <span>{formatTimeAgo(blog.published_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No articles yet</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Join the Discussion</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Share your thoughts with fellow Mets fans
                </p>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/community")}
                  className="w-full"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityPreviewSection;
