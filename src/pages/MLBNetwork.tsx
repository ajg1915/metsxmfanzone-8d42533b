import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const MLBNetwork = () => {
  const { isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet>
          <title>MLB Network Live - Watch Baseball Games & Analysis | MetsXMFanZone</title>
          <meta name="description" content="Watch MLB Network live games, highlights, and expert baseball analysis. Stream 24/7 MLB coverage featuring your favorite teams." />
          <meta name="keywords" content="MLB Network, live baseball, MLB live stream, baseball games live, MLB analysis, baseball coverage" />
          <link rel="canonical" href="https://www.metsxmfanzone.com/mlb-network" />
        </Helmet>
        <Navigation />
        
        <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary">
              <CardContent className="py-12 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Premium Access Required</h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to Premium or Annual plan to watch MLB Network live streams
                </p>
                <Button size="lg" onClick={() => navigate("/plans")}>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>MLB Network Live - Watch Baseball Games & Analysis | MetsXMFanZone</title>
        <meta name="description" content="Watch MLB Network live games, highlights, and expert baseball analysis. Stream 24/7 MLB coverage featuring your favorite teams." />
        <meta name="keywords" content="MLB Network, live baseball, MLB live stream, baseball games live, MLB analysis, baseball coverage" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/mlb-network" />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
            MLB Network
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Live baseball coverage, highlights, and expert analysis from across the league
          </p>

          <StreamPlayer 
            pageName="mlb-network"
            pageTitle="MLB Network Live"
            pageDescription="Watch live baseball games and expert analysis"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MLBNetwork;
