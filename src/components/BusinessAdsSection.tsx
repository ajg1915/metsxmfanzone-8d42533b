import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessAd {
  id: string;
  business_name: string;
  ad_title: string;
  ad_description: string;
  ad_image_url: string | null;
  website_url: string | null;
  published_at: string | null;
}

const BusinessAdsSection = () => {
  const [ads, setAds] = useState<BusinessAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedAds();
  }, []);

  const fetchApprovedAds = async () => {
    try {
      const { data, error } = await supabase
        .from("business_ads_public")
        .select("*")
        .eq("status", "approved")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching approved ads:", error);
        return;
      }

      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Featured Business Partners</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50 border-border/50">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    return null; // Don't show section if no approved ads
  }

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Featured Business Partners</h2>
        <Badge variant="secondary" className="ml-2">Sponsored</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <Card 
            key={ad.id} 
            className="bg-card/80 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 overflow-hidden group"
          >
            {ad.ad_image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={ad.ad_image_url}
                  alt={ad.ad_title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            )}
            
            <CardHeader className={ad.ad_image_url ? "-mt-8 relative z-10" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{ad.business_name}</span>
              </div>
              <CardTitle className="text-lg text-foreground line-clamp-2">
                {ad.ad_title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="text-muted-foreground line-clamp-3">
                {ad.ad_description}
              </CardDescription>
              
              {ad.website_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group/btn hover:bg-primary hover:text-primary-foreground"
                  onClick={() => window.open(ad.website_url!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2 transition-transform group-hover/btn:translate-x-1" />
                  Visit Website
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default BusinessAdsSection;
