import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Radio, Tv, Users } from "lucide-react";

const Live = () => {
  const liveStreams = [
    {
      title: "Mets Game Day Live",
      description: "Pre-game analysis and live game coverage",
      status: "LIVE NOW",
      viewers: "2.3K",
      icon: Radio,
    },
    {
      title: "Just Live Baseball",
      description: "24/7 baseball coverage and highlights",
      status: "LIVE NOW",
      viewers: "1.8K",
      icon: Tv,
    },
    {
      title: "SNY Network Stream",
      description: "Official Mets network coverage",
      status: "LIVE NOW",
      viewers: "4.1K",
      icon: Tv,
    },
    {
      title: "Fan Zone Podcast",
      description: "Live fan discussions and call-ins",
      status: "STARTING SOON",
      viewers: "856",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Live Streams
              </h1>
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                Watch live Mets coverage, pre-game shows, post-game analysis, and exclusive fan content
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
              {liveStreams.map((stream, index) => {
                const Icon = stream.icon;
                return (
                  <Card key={index} className="border-2 border-primary bg-card hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="w-8 h-8 text-primary" />
                        <Badge className={stream.status === "LIVE NOW" ? "bg-red-600 text-white" : "bg-primary text-primary-foreground"}>
                          {stream.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-primary">{stream.title}</CardTitle>
                      <CardDescription className="text-foreground">
                        {stream.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {stream.viewers} watching
                        </span>
                        <Button className="gap-2">
                          <Play className="w-4 h-4" />
                          Watch Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Card className="border-2 border-primary bg-card max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Premium Access Required</CardTitle>
                  <CardDescription className="text-foreground">
                    Get unlimited access to all live streams, replays, and exclusive content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full md:w-auto">
                    Start 7-Day Free Trial
                  </Button>
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

export default Live;
