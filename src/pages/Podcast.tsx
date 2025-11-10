import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Mic, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SocialShareButtons from "@/components/SocialShareButtons";

const Podcast = () => {
  const navigate = useNavigate();

  const liveShows = [
    {
      title: "MLB Network Live",
      description: "24/7 baseball coverage and analysis",
      path: "/mlb-network",
    },
    {
      title: "MetsXMFanZoneTV",
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
        <meta
          name="description"
          content="Listen to the best Mets podcasts, live shows, game analysis, and fan discussions. Daily Mets content featuring expert commentary and interviews."
        />
        <meta
          name="keywords"
          content="Mets podcast, baseball podcast, Mets live show, Mets audio, MLB podcast, Mets commentary, Mets interviews"
        />
        <link rel="canonical" href="https://www.metsxmfanzone.com/podcast" />
      </Helmet>
      <Navigation />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 mb-4 sm:mb-6">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Podcasts & Live Shows
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Listen to exclusive Mets content, live shows, and in-depth discussions
            </p>
          </div>

          {/* Live Streams Section */}
          <section className="mb-8 sm:mb-12">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Live Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {liveShows.map((show, index) => (
                <Card key={index} className="border-2 border-primary hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg md:text-xl">{show.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{show.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full gap-2 text-sm sm:text-base" size="lg" onClick={() => navigate(show.path)}>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                      Watch Live
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Social Share Section */}
          <section className="mb-8 sm:mb-12">
            <Card>
              <CardContent className="py-4 sm:py-6">
                <SocialShareButtons title="MetsXMFanZone Podcasts" />
              </CardContent>
            </Card>
          </section>

          {/* Podcast Episodes */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 sm:mb-6">Recent Episodes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {podcastEpisodes.map((episode, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-full h-32 sm:h-40 bg-primary/10 rounded-md flex items-center justify-center mb-3 sm:mb-4">
                      <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <CardTitle className="text-sm sm:text-base md:text-lg">{episode.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{episode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      <span>{episode.duration}</span>
                      <span>{episode.date}</span>
                    </div>
                    <Button variant="outline" className="w-full gap-2 text-sm sm:text-base">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
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