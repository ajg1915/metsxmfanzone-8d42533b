import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Mic, Radio } from "lucide-react";
import SocialShareButtons from "@/components/SocialShareButtons";

const Podcast = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();

  if (authLoading || subLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isPremium) {
    return <Navigate to="/plans" replace />;
  }

  const liveShows = [
    {
      title: "MLB Network Live",
      description: "24/7 baseball coverage and analysis",
      path: "/mlb-network",
    },
    {
      title: "MetsXMFanZone TV",
      description: "Exclusive Mets live content and discussions",
      path: "/metsxmfanzone-tv",
    },
  ];

  const podcastEpisodes = [
    {
      title: "The Mets Morning Show",
      description: "Daily news, analysis, and fan discussions",
      duration: "45 min",
      date: "Today",
    },
    {
      title: "Game Day Breakdown",
      description: "In-depth analysis of recent Mets games",
      duration: "60 min",
      date: "Yesterday",
    },
    {
      title: "Off-Season Insights",
      description: "Free agency moves and spring training preview",
      duration: "55 min",
      date: "2 days ago",
    },
    {
      title: "Legends of Queens",
      description: "Interviews with former Mets players",
      duration: "50 min",
      date: "3 days ago",
    },
    {
      title: "Fantasy Baseball Talk",
      description: "Draft strategies and player rankings",
      duration: "40 min",
      date: "4 days ago",
    },
    {
      title: "The Farm Report",
      description: "Mets minor league system updates",
      duration: "35 min",
      date: "5 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Mets Podcast - Live Shows & Exclusive Audio Content | MetsXMFanZone</title>
        <meta name="description" content="Listen to the best Mets podcasts, live shows, game analysis, and fan discussions. Daily Mets content featuring expert commentary and interviews." />
        <meta name="keywords" content="Mets podcast, baseball podcast, Mets live show, Mets audio, MLB podcast, Mets commentary, Mets interviews" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/podcast" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Podcasts & Live Shows
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Listen to exclusive Mets content, live shows, and in-depth discussions
            </p>
          </div>

          {/* Live Streams Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Radio className="w-6 h-6 text-primary animate-pulse" />
              <h2 className="text-3xl font-bold text-foreground">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveShows.map((show, index) => (
                <Card key={index} className="border-2 border-primary hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{show.title}</CardTitle>
                    <CardDescription>{show.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full gap-2" 
                      size="lg"
                      onClick={() => navigate(show.path)}
                    >
                      <Play className="w-5 h-5" />
                      Watch Live
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Social Share Section */}
          <section className="mb-12">
            <Card>
              <CardContent className="py-6">
                <SocialShareButtons title="MetsXMFanZone Podcasts" />
              </CardContent>
            </Card>
          </section>

          {/* Podcast Episodes */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-6">Recent Episodes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcastEpisodes.map((episode, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-full h-40 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                      <Mic className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{episode.title}</CardTitle>
                    <CardDescription>{episode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{episode.duration}</span>
                      <span>{episode.date}</span>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Play className="w-4 h-4" />
                      Listen Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Podcast;
