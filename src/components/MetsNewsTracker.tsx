import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock } from "lucide-react";

const MetsNewsTracker = () => {
  const newsItems = [
    {
      id: 1,
      type: "signing",
      title: "Mets Sign Star Outfielder",
      player: "Juan Soto",
      details: "3-year deal worth $120M",
      time: "2 hours ago",
      image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      type: "rumor",
      title: "Trade Talks Heating Up",
      player: "Pete Alonso",
      details: "Multiple teams showing interest in star first baseman",
      time: "5 hours ago",
      image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      type: "signing",
      title: "Pitching Rotation Addition",
      player: "New Ace Acquisition",
      details: "2-year contract finalized",
      time: "8 hours ago",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      type: "rumor",
      title: "Front Office Activity",
      player: "Edwin Diaz Extension",
      details: "Negotiations ongoing for contract extension",
      time: "12 hours ago",
      image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=400&fit=crop"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Live Updates</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Mets News Tracker
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest signings, trades, and rumors from the Mets front office
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {newsItems.map((item) => (
            <Card 
              key={item.id} 
              className="border-2 border-border bg-card overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex gap-4 p-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary transition-colors">
                    <img 
                      src={item.image} 
                      alt={item.player}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className={`absolute -top-1 -right-1 p-2 rounded-full ${
                    item.type === 'signing' ? 'bg-green-500' : 'bg-amber-500'
                  }`}>
                    {item.type === 'signing' ? (
                      <TrendingUp className="w-4 h-4 text-white" />
                    ) : (
                      <Users className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <CardHeader className="p-0 mb-3">
                    <Badge 
                      className={`w-fit mb-2 ${
                        item.type === 'signing' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-amber-500 hover:bg-amber-600'
                      } text-white`}
                    >
                      {item.type === 'signing' ? 'NEW SIGNING' : 'TRADE RUMOR'}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-base font-semibold text-primary mb-2">
                      {item.player}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.details}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetsNewsTracker;
