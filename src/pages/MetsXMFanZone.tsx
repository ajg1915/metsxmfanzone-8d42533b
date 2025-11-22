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

const MetsXMFanZone = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>MetsXMFanZone TV - Watch Live Mets Shows & Exclusive Content</title>
        <meta name="description" content="Watch MetsXMFanZone TV for exclusive Mets live shows, fan discussions, and 24/7 coverage. Your ultimate destination for Mets content." />
        <meta name="keywords" content="MetsXMFanZone TV, Mets live show, Mets fan TV, exclusive Mets content, Mets 24/7" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/metsxmfanzone-tv" />
      </Helmet>
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">MetsXMFanZone TV</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Your exclusive destination for Mets content, fan discussions, and live coverage
          </p>

          <StreamPlayer
            pageName="metsxmfanzone"
            pageTitle="MetsXMFanZone Live Stream"
            pageDescription="Ulimate Destination Where the Fans Go"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MetsXMFanZone;
