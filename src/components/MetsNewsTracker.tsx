import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Newspaper, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";


interface NewsItem {
  id: string;
  type: "signing" | "traded" | "news" | "injury";
  title: string;
  player: string;
  details: string;
  time_ago: string;
  image_url: string;
  link?: string | null;
  is_mets_related?: boolean;
  is_manual?: boolean;
}

const MetsNewsTracker = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [metsOnly, setMetsOnly] = useState(false);

  const fetchNewsItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: apiData, error: fetchError } = await supabase.functions.invoke('fetch-mets-news');
      const { data: manualData, error: dbError } = await supabase
        .from("mets_news_tracker")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      
      let apiNews: NewsItem[] = [];
      let manualNews: NewsItem[] = [];
      
      if (!fetchError && apiData?.success && apiData?.news) {
        apiNews = [...apiData.news];
        setLastUpdated(new Date(apiData.fetched_at));
      }
      
      if (!dbError && manualData && manualData.length > 0) {
        manualNews = manualData.map((item) => ({
          id: item.id,
          type: item.type as NewsItem["type"],
          title: item.title,
          player: item.player,
          details: item.details,
          time_ago: item.time_ago,
          image_url: item.image_url,
          is_mets_related: true,
          is_manual: true,
        }));
      }
      
      setNewsItems([...manualNews, ...apiNews]);
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
    const interval = setInterval(fetchNewsItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getTypeConfig = (type: NewsItem["type"]) => {
    switch (type) {
      case "signing":
        return { icon: TrendingUp, label: "NEW SIGNING", color: "bg-green-500/90 hover:bg-green-600/90", iconBg: "bg-green-500" };
      case "traded":
        return { icon: Users, label: "TRADE NEWS", color: "bg-blue-500/90 hover:bg-blue-600/90", iconBg: "bg-blue-500" };
      case "injury":
        return { icon: AlertCircle, label: "INJURY UPDATE", color: "bg-red-500/90 hover:bg-red-600/90", iconBg: "bg-red-500" };
      default:
        return { icon: Newspaper, label: "MLB NEWS", color: "bg-primary/90 hover:bg-primary", iconBg: "bg-primary" };
    }
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
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
      <section className="py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchNewsItems} variant="outline" size="sm" className="glass-card">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) return null;

  const filteredNews = metsOnly 
    ? newsItems.filter(item => item.is_mets_related)
    : newsItems.filter(item => !item.is_manual);

  if (filteredNews.length === 0 && metsOnly && newsItems.length > 0) {
    return (
      <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 glass-card rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Live MetsXMFanZone Newsroom</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">MLB Live Tracker</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Label htmlFor="mets-filter" className="text-sm font-medium">All MLB</Label>
              <Switch id="mets-filter" checked={metsOnly} onCheckedChange={setMetsOnly} />
              <Label htmlFor="mets-filter" className="text-sm font-medium text-primary">Mets Only</Label>
            </div>
          </motion.div>
          <div className="text-center py-8">
            <img src="https://a.espncdn.com/i/teamlogos/mlb/500/nym.png" alt="Mets Logo" className="w-20 h-20 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No Mets-specific news at the moment.</p>
            <Button onClick={() => setMetsOnly(false)} variant="outline" size="sm" className="mt-4 glass-card">
              View All MLB News
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-4 py-2 glass-card rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">Live MetsXMFanZone Newsroom</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            MLB Live Tracker
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-2">
            Real-time news, signings, trades, and updates from around the league
          </p>
          
          <div className="flex items-center justify-center gap-3 mt-4 mb-2">
            <Label htmlFor="mets-filter-main" className="text-sm font-medium cursor-pointer">All MLB</Label>
            <Switch id="mets-filter-main" checked={metsOnly} onCheckedChange={setMetsOnly} />
            <Label htmlFor="mets-filter-main" className="text-sm font-medium text-primary cursor-pointer">Mets Only</Label>
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {/* Featured First News Item */}
        {filteredNews.length > 0 && (() => {
          const featuredItem = filteredNews[0];
          const featuredConfig = getTypeConfig(featuredItem.type);
          const FeaturedIcon = featuredConfig.icon;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => featuredItem.link && window.open(featuredItem.link, '_blank')}
              className={`glass-card hover-lift glow-blue rounded-xl sm:rounded-2xl overflow-hidden group mb-4 sm:mb-6 ${featuredItem.link ? 'cursor-pointer' : ''}`}
              role={featuredItem.link ? "button" : undefined}
              tabIndex={featuredItem.link ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && featuredItem.link && window.open(featuredItem.link, '_blank')}
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/3 aspect-[16/9] md:aspect-auto">
                  <img 
                    src={featuredItem.image_url} 
                    alt={featuredItem.player} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card/80" />
                  <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 p-2 sm:p-2.5 rounded-full ${featuredConfig.iconBg} backdrop-blur-sm`}>
                    <FeaturedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  {/* Mobile overlay content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:hidden">
                    <Badge className={`mb-2 text-[10px] sm:text-xs ${featuredConfig.color} text-white backdrop-blur-sm`}>
                      {featuredConfig.label}
                    </Badge>
                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
                      {featuredItem.title}
                    </h3>
                  </div>
                </div>
                {/* Desktop content */}
                <div className="hidden md:flex p-6 md:w-2/3 flex-col justify-center">
                  <Badge className={`w-fit mb-3 ${featuredConfig.color} text-white backdrop-blur-sm`}>
                    {featuredConfig.label}
                  </Badge>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                    {featuredItem.title}
                  </h3>
                  <p className="text-lg font-semibold text-primary mb-2">{featuredItem.player}</p>
                  <p className="text-base text-muted-foreground mb-4 line-clamp-3">{featuredItem.details}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {featuredItem.time_ago}
                    </div>
                    {featuredItem.link && (
                      <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Read full story</span>
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Mobile bottom bar */}
                <div className="flex md:hidden items-center justify-between p-3 border-t border-border/30">
                  <p className="text-xs sm:text-sm font-medium text-primary truncate max-w-[60%]">{featuredItem.player}</p>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {featuredItem.time_ago}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Remaining News Items - Compact Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNews.slice(1).map((item, index) => {
            const typeConfig = getTypeConfig(item.type);
            const IconComponent = typeConfig.icon;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => item.link && window.open(item.link, '_blank')}
                className={`glass-card hover-lift rounded-xl overflow-hidden group ${item.link ? 'cursor-pointer' : ''}`}
                role={item.link ? "button" : undefined}
                tabIndex={item.link ? 0 : undefined}
                onKeyDown={(e) => e.key === 'Enter' && item.link && window.open(item.link, '_blank')}
              >
                <div className="flex gap-3 p-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                      <img 
                        src={item.image_url} 
                        alt={item.player} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://a.espncdn.com/i/teamlogos/mlb/500/nym.png";
                        }}
                      />
                    </div>
                    <div className={`absolute -top-1 -right-1 p-1.5 rounded-full ${typeConfig.iconBg} backdrop-blur-sm`}>
                      <IconComponent className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Badge className={`mb-1.5 text-[10px] px-1.5 py-0.5 ${typeConfig.color} text-white`}>
                      {typeConfig.label}
                    </Badge>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      {item.time_ago}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <Button onClick={fetchNewsItems} variant="outline" size="sm" className="gap-2 glass-card">
            <RefreshCw className="w-4 h-4" />
            Refresh News
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MetsNewsTracker;
