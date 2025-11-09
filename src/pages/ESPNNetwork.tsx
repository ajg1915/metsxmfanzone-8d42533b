import { Helmet } from "react-helmet-async";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ESPNNetwork = () => {
  const { isPremium, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
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
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>ESPN Network Live - Watch ESPN Baseball Coverage | MetsXMFanZone</title>
          <meta name="description" content="Watch ESPN Network live baseball coverage, game analysis, and expert commentary. Stream ESPN content 24/7 on MetsXMFanZone." />
          <meta name="keywords" content="ESPN network, ESPN baseball, ESPN live stream, baseball coverage, sports network, live baseball" />
          <link rel="canonical" href="https://www.metsxmfanzone.com/espn-network" />
        </Helmet>
        <Navigation />
        
        <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary">
              <CardContent className="py-12 text-center">
                <Lock className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Premium Access Required</h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to Premium or Annual plan to watch ESPN Network live streams
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
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>ESPN Network Live - Watch ESPN Baseball Coverage | MetsXMFanZone</title>
        <meta name="description" content="Watch ESPN Network live baseball coverage, game analysis, and expert commentary. Stream ESPN content 24/7 on MetsXMFanZone." />
        <meta name="keywords" content="ESPN network, ESPN baseball, ESPN live stream, baseball coverage, sports network, live baseball" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/espn-network" />
      </Helmet>
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
            ESPN Network
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Watch ESPN Network live baseball coverage and analysis
          </p>

          <StreamPlayer 
            pageName="espn-network"
            pageTitle="ESPN Network"
            pageDescription="Watch ESPN Network live baseball coverage and analysis"
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ESPNNetwork;
