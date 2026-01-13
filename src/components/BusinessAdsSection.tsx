import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "@/components/ScrollReveal";
import GlassCard from "@/components/GlassCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
      <section className="py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3 sm:mb-4 md:mb-6">
            <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">Featured Business Partners</h2>
            <Badge variant="secondary" className="ml-2 text-[10px] sm:text-xs">Sponsored</Badge>
          </div>
          <div className="flex gap-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex-1 min-w-0 h-56 sm:h-72 md:h-80 lg:h-96">
                <Skeleton className="h-full w-full rounded-lg" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <ScrollReveal direction="up">
      <section className="py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-4">
          <GlassCard glow="blue" className="p-4 sm:p-6">
          <ScrollReveal direction="left" delay={100}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              <Megaphone className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                Featured Business Partners
              </h2>
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">Sponsored</Badge>
            </div>
          </ScrollReveal>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent className="-ml-3 md:-ml-6">
              {ads.map((ad, index) => (
                <CarouselItem 
                  key={ad.id} 
                  className="pl-3 md:pl-6 basis-1/2 sm:basis-1/3 lg:basis-1/3"
                >
                  <ScrollReveal direction="scale" delay={index * 100}>
                    <Card 
                      className="h-56 sm:h-72 md:h-80 lg:h-96 cursor-pointer overflow-hidden group border border-border/50 hover:border-primary transition-all duration-300 relative hover-glow"
                      onClick={() => ad.website_url && window.open(ad.website_url, '_blank', 'noopener,noreferrer')}
                    >
                      <div className="relative w-full h-full">
                        {ad.ad_image_url ? (
                          <img 
                            src={ad.ad_image_url} 
                            alt={ad.ad_title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Building2 className="h-12 w-12 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        
                        {ad.website_url && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                              {ad.business_name}
                            </span>
                          </div>
                          <p className="text-foreground text-[10px] sm:text-xs font-semibold line-clamp-2">
                            {ad.ad_title}
                          </p>
                          <p className="text-muted-foreground text-[9px] sm:text-[10px] line-clamp-2 mt-0.5">
                            {ad.ad_description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </ScrollReveal>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 h-8 w-8 border-border/50 bg-background/80 hover:bg-background" />
            <CarouselNext className="hidden md:flex -right-4 h-8 w-8 border-border/50 bg-background/80 hover:bg-background" />
          </Carousel>
          </GlassCard>
        </div>
      </section>
    </ScrollReveal>
  );
};

export default BusinessAdsSection;
