import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/metsxmfanzone-logo.png";

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

const CommunityPreviewSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ postsCount: 0, membersCount: 0 });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {setIsAdmin(false);return;}
    supabase.
    from("user_roles").
    select("role").
    eq("user_id", user.id).
    then(({ data }) => {
      setIsAdmin(data?.some((r) => r.role === "admin") ?? false);
    });
  }, [user]);

  const handlePostClick = () => {
    navigate(isAdmin ? "/admin/stories" : "/community");
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      // Fetch admin user IDs
      const { data: adminRoles } = await supabase.
      from("user_roles").
      select("user_id").
      eq("role", "admin");

      const adminUserIds = new Set((adminRoles || []).map((r) => r.user_id));

      // Fetch latest posts
      const { data: postsData } = await supabase.
      from("posts").
      select(`
          id,
          user_id,
          content,
          image_url,
          created_at,
          profiles (
            full_name,
            email
          )
        `).
      order("created_at", { ascending: false }).
      limit(5);

      // Get counts
      const { count: postsCount } = await supabase.
      from("posts").
      select("*", { count: "exact", head: true });

      const { count: membersCount } = await supabase.
      from("profiles").
      select("*", { count: "exact", head: true });

      // Generate signed URLs for images
      const postsWithSignedUrls = await Promise.all(
        (postsData || []).map(async (post) => {
          let imageUrl = post.image_url;
          if (post.image_url) {
            const fileName = post.image_url.split('/community_images/')[1] || post.image_url;
            if (fileName) {
              const { data: signedUrlData } = await supabase.storage.
              from('community_images').
              createSignedUrl(fileName, 3600);
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
      <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-6">
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
      </section>);

  }

  return (
    <section className="py-12 sm:py-16 md:py-20 px-3 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3 leading-tight text-base">
              <img src={logo} alt="MetsXMFanZone" className="w-7 h-7 sm:w-8 sm:h-8" />
              MetsXMFanZone Community
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-1.5">
              Join the conversation with {stats.membersCount.toLocaleString()}+ Mets fans
            </p>
          </div>
          <Button
            onClick={() => navigate("/community")}
            className="group text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">

            Join Community
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Badge variant="secondary" className="bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            {stats.postsCount.toLocaleString()} Posts
          </Badge>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
            <img src={logo} alt="" className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            {stats.membersCount.toLocaleString()} Members
          </Badge>
        </div>

        {/* Recent Posts - Full Width */}
        <div className="space-y-4 sm:space-y-5">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 sm:w-5 sm:h-5 text-primary" />
            Recent Posts
          </h3>
          
          {posts.length > 0 ?
          <>
              {/* Featured Highlight Post */}
              <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              onClick={handlePostClick}
              className="cursor-pointer group glass-card hover-lift glow-blue rounded-xl overflow-hidden">

                <div className="flex flex-col sm:flex-row">
                  {/* Large Featured Image/Avatar */}
                  <div className="relative w-full sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-card">
                    {posts[0].image_url ?
                  <img
                    src={posts[0].image_url}
                    alt="Featured Post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> :


                  <div className="w-full h-full min-h-[160px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Avatar className="w-20 h-20">
                          <AvatarFallback className="bg-primary/30 text-primary text-2xl">
                            {posts[0].isAdmin ? "M" : posts[0].profiles?.full_name?.[0] || "M"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                  }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-card/30" />
                    <Badge className="absolute top-3 left-3 text-xs px-2 py-0.5 bg-primary text-primary-foreground border-0 shadow-lg">
                      Latest
                    </Badge>
                    {/* Mobile overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:hidden">
                      <span className="text-sm font-semibold text-white drop-shadow-lg">
                        {posts[0].isAdmin ? "MetsXMFanZone" : posts[0].profiles?.full_name || "MetsXMFanZone"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Desktop Content */}
                  <div className="hidden sm:flex flex-1 p-4 sm:p-5 flex-col justify-center">
                    <span className="text-base font-bold text-foreground mb-2">
                      {posts[0].isAdmin ? "MetsXMFanZone" : posts[0].profiles?.full_name || "MetsXMFanZone"}
                    </span>
                    {posts[0].content &&
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {posts[0].content}
                      </p>
                  }
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{formatTimeAgo(posts[0].created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Mobile bottom bar */}
                  <div className="flex sm:hidden items-center justify-between p-3 border-t border-border/20">
                    <p className="text-xs text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {posts[0].content}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                      <MessageSquare className="w-3 h-3" />
                      <span>{formatTimeAgo(posts[0].created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Remaining Posts - Compact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {posts.slice(1).map((post, index) =>
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={handlePostClick}
                className="cursor-pointer group glass-card hover-lift glow-blue rounded-lg overflow-hidden">

                    <div className="flex gap-3 p-2.5">
                      {/* Thumbnail */}
                      {post.image_url ?
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                        </div> :

                  <div className="w-20 h-20 flex-shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {post.isAdmin ? "M" : post.profiles?.full_name?.[0] || "M"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                  }
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground text-sm">
                              {post.isAdmin ? "MetsXMFanZone" : post.profiles?.full_name?.split(' ')[0] || "MetsXMFanZone"}
                            </span>
                          </div>
                          {post.content &&
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                              {post.content}
                            </p>
                      }
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              )}
              </div>
            </> :

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Be the first to post!</p>
              </CardContent>
            </Card>
          }

          {/* CTA Card */}
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 mt-3 sm:mt-4">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 text-center sm:text-left">
                <img src={logo} alt="MetsXMFanZone" className="w-6 h-6 sm:w-8 sm:h-8" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Join the Discussion</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Share your thoughts with fellow Mets fans
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => navigate("/community")}
                className="text-xs sm:text-sm h-8 sm:h-9">

                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>);

};

export default CommunityPreviewSection;