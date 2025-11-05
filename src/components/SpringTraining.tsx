import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

const SpringTraining = () => {
  const games = [
    {
      id: 1,
      home: "Mets",
      away: "Yankees",
      date: "Sat, Feb 28, 1:05 PM",
      location: "Clover Park, Port St. Lucie, FL",
      description: "Spring training opener against the Yankees",
      colors: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 2,
      home: "Mets",
      away: "Astros",
      date: "Mon, Mar 2, 1:05 PM",
      location: "Clover Park, Port St. Lucie, FL",
      description: "Spring training matchup",
      colors: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 3,
      home: "Mets",
      away: "Cardinals",
      date: "Thu, Mar 5, 1:05 PM",
      location: "Roger Dean Stadium, Jupiter, FL",
      description: "Away spring training game",
      colors: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 4,
      home: "Mets",
      away: "Nationals",
      date: "Sun, Mar 8, 1:05 PM",
      location: "Clover Park, Port St. Lucie, FL",
      description: "Spring training home game",
      colors: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 5,
      home: "Mets",
      away: "Red Sox",
      date: "Wed, Mar 11, 1:05 PM",
      location: "JetBlue Park, Fort Myers, FL",
      description: "Away spring training game",
      colors: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      id: 6,
      home: "Mets",
      away: "Braves",
      date: "Sat, Mar 14, 1:05 PM",
      location: "Clover Park, Port St. Lucie, FL",
      description: "Spring training divisional matchup",
      colors: "bg-gradient-to-br from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            2026 Spring Training
          </h2>
          <p className="text-foreground">Upcoming games and exclusive coverage</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="border-2 border-primary bg-card overflow-hidden hover:shadow-xl transition-shadow">
              <div className={`h-48 ${game.colors} relative flex items-center justify-center`}>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    UPCOMING
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {game.home} vs {game.away}
                  </div>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  {game.home} vs {game.away}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  {game.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {game.location}
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  {game.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpringTraining;
