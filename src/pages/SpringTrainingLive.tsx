import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MetsNewsTracker from "@/components/MetsNewsTracker";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Lock, Calendar, TrendingUp, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  category: string;
  published_at: string;
}

const SpringTrainingLive = () => {
  const { user, loading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, category, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (data) {
        setBlogPosts(data as BlogPost[]);
      }
    };

    fetchBlogPosts();
  }, []);

  // Redirect non-logged-in users
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login&redirect=/spring-training-live");
    }
  }, [user, loading, navigate]);

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
          <Card className="max-w-2xl mx-auto border-2 border-primary">
            <CardContent className="py-12 text-center">
              <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Premium Access Required</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to unlock Spring Training live streams and exclusive content
              </p>
              <Button size="lg" onClick={() => navigate("/plans")}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Mets 2026 Spring Training Live - Exclusive Coverage | MetsXMFanZone</title>
        <meta name="description" content="Watch Mets 2026 Spring Training live streams, get game stats, latest news and exclusive coverage from Port St. Lucie, Florida." />
        <meta name="keywords" content="Mets spring training 2026, spring training live, Mets preseason, Port St. Lucie, Mets training camp, Mets news" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/spring-training-live" />
      </Helmet>
      <Navigation />

      <main className="flex-1 pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                    Mets 2026 Spring Training
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Live from Clover Park, Port St. Lucie, Florida
                  </p>
                </div>
              </div>
              
              {/* Follow Facebook Button */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open('https://facebook.com/metsxmfanzone', '_blank')}
                >
                  <Facebook className="w-5 h-5" />
                  Follow MetsXMFanZone on Facebook
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stream Section */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <StreamPlayer 
                pageName="spring-training"
                pageTitle="Spring Training Live Stream"
                pageDescription="Live coverage from Clover Park"
              />
            </div>
          </div>
        </section>

        {/* Game Stats & News Tracker */}
        <MetsNewsTracker />

        {/* Latest Mets News */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Latest Mets News</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <Card 
                    key={post.id}
                    className="border-2 border-primary bg-card overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {post.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.featured_image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <Badge className="w-fit mb-2 bg-primary text-primary-foreground">
                        {post.category}
                      </Badge>
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SNY Mets Feed Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">SNY Mets Feed</h2>
              </div>
              
              <Card className="border-2 border-primary">
                <CardContent className="p-0">
                  <iframe
                    src="https://sny.tv/mets-feed"
                    className="w-full h-[600px] border-0"
                    title="SNY Mets Feed"
                    loading="lazy"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SpringTrainingLive;
