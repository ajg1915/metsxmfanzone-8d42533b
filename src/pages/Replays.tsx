import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Play } from "lucide-react";
import springImage from "@/assets/spring-training.jpg";

const Replays = () => {
  const replays = [
    {
      title: "Mets vs Yankees",
      date: "Oct 28, 2024",
      location: "Citi Field, NY",
      score: "Mets 5 - 3 Yankees",
      duration: "2h 45m",
      result: "WIN",
    },
    {
      title: "Mets vs Phillies",
      date: "Oct 25, 2024",
      location: "Citizens Bank Park, PA",
      score: "Mets 4 - 6 Phillies",
      duration: "3h 12m",
      result: "LOSS",
    },
    {
      title: "Mets vs Braves",
      date: "Oct 22, 2024",
      location: "Citi Field, NY",
      score: "Mets 8 - 2 Braves",
      duration: "2h 58m",
      result: "WIN",
    },
    {
      title: "Mets vs Nationals",
      date: "Oct 19, 2024",
      location: "Nationals Park, DC",
      score: "Mets 3 - 3 Nationals",
      duration: "3h 24m",
      result: "TIE",
    },
    {
      title: "Mets vs Marlins",
      date: "Oct 16, 2024",
      location: "Citi Field, NY",
      score: "Mets 7 - 1 Marlins",
      duration: "2h 35m",
      result: "WIN",
    },
    {
      title: "Mets vs Red Sox",
      date: "Oct 13, 2024",
      location: "Fenway Park, MA",
      score: "Mets 2 - 5 Red Sox",
      duration: "3h 01m",
      result: "LOSS",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Game Replays
              </h1>
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                Watch full game replays on demand. Never miss a moment of Mets baseball.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {replays.map((replay, index) => (
                <Card key={index} className="border-2 border-primary bg-card hover:shadow-xl transition-all">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={springImage} 
                      alt={replay.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <Badge className={
                        replay.result === "WIN" ? "bg-green-600 text-white" :
                        replay.result === "LOSS" ? "bg-red-600 text-white" :
                        "bg-yellow-600 text-white"
                      }>
                        {replay.result}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-foreground mb-1">{replay.score}</h3>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{replay.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      {replay.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {replay.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      {replay.duration}
                    </div>
                    <Button className="w-full gap-2 mt-4">
                      <Play className="w-4 h-4" />
                      Watch Full Game
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Card className="border-2 border-primary bg-card max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Access All Game Replays</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-6">
                    Subscribe to get unlimited access to full game replays, condensed games, and exclusive behind-the-scenes content
                  </p>
                  <Button size="lg">
                    Start Free Trial
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

export default Replays;
