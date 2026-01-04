import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Newspaper, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  type: "signing" | "traded" | "news" | "injury";
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
  link?: string | null;
}

interface MetsNewsTrackerProps {
  className?: string;
}

const MetsNewsTracker = ({ className }: MetsNewsTrackerProps) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNewsItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('fetch-mets-news');
      
      if (fetchError) {
        console.error("Error fetching Mets news:", fetchError);
        throw fetchError;
      }
      
      if (data?.success && data?.news) {
        setNewsItems(data.news);
        setLastUpdated(new Date(data.fetched_at));
      } else {
        setNewsItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch Mets news:", err);
      setError("Unable to load news. Please try again later.");
      setNewsItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsItems();
    
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNewsItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTypeConfig = (type: NewsItem["type"]) => {
    switch (type) {
      case "signing":
        return {
          icon: TrendingUp,
          label: "NEW SIGNING",
          color: "bg-green-500 hover:bg-green-600",
          iconBg: "bg-green-500"
        };
      case "traded":
        return {
          icon: Users,
          label: "TRADE NEWS",
          color: "bg-blue-500 hover:bg-blue-600",
          iconBg: "bg-blue-500"
        };
      case "injury":
        return {
          icon: AlertCircle,
          label: "INJURY UPDATE",
          color: "bg-red-500 hover:bg-red-600",
          iconBg: "bg-red-500"
        };
      default:
        return {
          icon: Newspaper,
          label: "MLB NEWS",
          color: "bg-primary hover:bg-primary/90",
          iconBg: "bg-primary"
        };
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading MLB news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-background via-secondary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchNewsItems} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
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
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Live Updates from ESPN</span>
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-4">
          MLB Live Tracker
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
          Real-time news, signings, trades, and updates from around the league
        </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {newsItems.map((item) => {
            const typeConfig = getTypeConfig(item.type);
            const IconComponent = typeConfig.icon;
            
            return (
              <Card 
                key={item.id} 
                className="border-2 border-border bg-card overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                onClick={() => item.link && window.open(item.link, '_blank')}
              >
                <div className="flex gap-4 p-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary transition-colors">
                      <img 
                        src={item.image_url} 
                        alt={item.player} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png";
                        }}
                      />
                    </div>
                    <div className={`absolute -top-1 -right-1 p-2 rounded-full ${typeConfig.iconBg}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <CardHeader className="p-0 mb-3">
                      <Badge className={`w-fit mb-2 ${typeConfig.color} text-white`}>
                        {typeConfig.label}
                      </Badge>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-base font-semibold text-primary mb-2">
                        {item.player}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.details}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {item.time_ago}
                        </div>
                        {item.link && (
                          <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Read more</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={fetchNewsItems} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh News
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MetsNewsTracker;
