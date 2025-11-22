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
