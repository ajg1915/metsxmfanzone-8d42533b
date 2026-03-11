import { useEffect, useState } from "react";
import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingBag, Tag } from "lucide-react";
import logo from "@/assets/metsxmfanzone-logo.png";

interface MercariListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  mercari_url: string;
  category: string | null;
  condition: string | null;
  is_sold: boolean | null;
  display_order: number | null;
}

const MercariShop = () => {
  const [listings, setListings] = useState<MercariListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from("mercari_listings")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (!error) setListings((data as unknown as MercariListing[]) || []);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const categories = ["All", ...new Set(listings.map(l => l.category || "General"))];
  const filtered = filter === "All" ? listings : listings.filter(l => l.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="MetsXMFanZone Mercari Shop - Collectibles & Gear"
        description="Shop Mets collectibles, jerseys, cards, and memorabilia from our Mercari store. Authentic fan gear at great prices."
        keywords="Mets Mercari, Mets collectibles, Mets cards, Mets jerseys, baseball memorabilia"
        canonical="https://www.metsxmfanzone.com/mercari-shop"
      />
      <Navigation />

      <main className="flex-1 pt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <img src={logo} alt="MetsXMFanZone" className="w-12 h-12" />
              <h1 className="text-3xl sm:text-4xl font-bold text-primary">Mercari Shop</h1>
            </div>
            <p className="text-muted-foreground">Mets collectibles, jerseys, cards & more — shop on Mercari</p>
          </div>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {/* Listings Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading listings...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No Listings Yet</h2>
              <p className="text-muted-foreground">Check back soon for Mets collectibles and gear!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((listing) => (
                <Card
                  key={listing.id}
                  className={`border-2 ${listing.is_sold ? 'border-muted opacity-75' : 'border-primary'} bg-card overflow-hidden hover:shadow-lg transition-all group`}
                >
                  <div className="aspect-square overflow-hidden relative">
                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                        <img src={logo} alt="MetsXMFanZone" className="w-20 h-20 opacity-50" />
                      </div>
                    )}
                    {listing.is_sold && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-lg font-bold text-destructive bg-background/80 px-4 py-2 rounded-lg">SOLD</span>
                      </div>
                    )}
                    {listing.condition && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                        {listing.condition}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base line-clamp-2">{listing.title}</CardTitle>
                    {listing.category && listing.category !== "General" && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Tag className="w-3 h-3" />
                        {listing.category}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {listing.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-primary">
                        ${Number(listing.price).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      disabled={listing.is_sold || false}
                      asChild={!listing.is_sold}
                    >
                      {listing.is_sold ? (
                        <span>Sold Out</span>
                      ) : (
                        <a href={listing.mercari_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buy on Mercari
                        </a>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MercariShop;
