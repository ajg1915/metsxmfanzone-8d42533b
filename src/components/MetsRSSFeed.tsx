import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

const MetsRSSFeed = () => {
  const [feedItems, setFeedItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRSSFeeds = async () => {
      try {
        // Using RSS2JSON service to fetch and parse RSS feeds
        const feeds = [
          {
            url: 'https://www.mlb.com/mets/feeds/news/rss.xml',
            source: 'MLB.com Mets'
          },
          {
            url: 'https://amazinavenue.com/rss',
            source: "Amazin' Avenue"
          }
        ];

        const allItems: RSSItem[] = [];

        for (const feed of feeds) {
          try {
            const response = await fetch(
              `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
            );
            const data = await response.json();

            if (data.status === 'ok' && data.items) {
              const items = data.items.slice(0, 5).map((item: any) => ({
                title: item.title,
                link: item.link,
                description: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
                pubDate: item.pubDate,
                source: feed.source
              }));
              allItems.push(...items);
            }
          } catch (error) {
            console.error(`Error fetching ${feed.source}:`, error);
          }
        }

        // Sort by date
        allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        setFeedItems(allItems.slice(0, 4));
      } catch (error) {
        console.error('Error fetching RSS feeds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRSSFeeds();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading Mets news feed...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {feedItems.map((item, index) => (
        <Card 
          key={index}
          className="border-2 border-border hover:border-primary transition-all group"
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {item.source}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(item.pubDate)}
              </div>
            </div>
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {item.description}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => window.open(item.link, '_blank')}
            >
              Read More
              <ExternalLink className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetsRSSFeed;
