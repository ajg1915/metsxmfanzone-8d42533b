import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SpringTraining from "@/components/SpringTraining";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const SpringTrainingLive = () => {
  const { user, loading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  // Redirect non-logged-in users
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login&redirect=/spring-training-live");
    }
  }, [user, loading, navigate]);

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
          <Card className="max-w-2xl mx-auto border-2 border-primary">
            <CardContent className="py-12 text-center">
              <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Premium Access Required</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to unlock Spring Training live streams and exclusive content
              </p>
              <Button size="lg" onClick={() => navigate("/plans")}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Spring Training Live Streams - Exclusive Mets Coverage | MetsXMFanZone</title>
        <meta name="description" content="Watch exclusive Mets Spring Training live streams. Get behind-the-scenes access and live coverage of all spring training games." />
        <meta name="keywords" content="Mets spring training live, spring training stream, Mets preseason, Port St. Lucie, Mets training camp" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/spring-training-live" />
      </Helmet>
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">Spring Training Live</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Exclusive live coverage of Mets Spring Training from Port St. Lucie, Florida
          </p>

          <StreamPlayer 
            pageName="spring-training"
            pageTitle="Spring Training Live Stream"
            pageDescription="Live from Clover Park in Port St. Lucie, FL"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpringTrainingLive;
