import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  type: "signing" | "rumor";
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
}

const MetsNewsTracker = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsItems = async () => {
      const { data, error } = await supabase
        .from("mets_news_tracker")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (data) {
        setNewsItems(data as NewsItem[]);
      }
      setLoading(false);
    };

    fetchNewsItems();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading news...</div>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-background via-secondary/10 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
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
                      src={item.image_url} 
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
                      {item.time_ago}
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
