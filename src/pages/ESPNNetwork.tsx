import { Helmet } from "react-helmet-async";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tv, Radio, Lock } from "lucide-react";
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
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            ESPN Network
          </h1>
          <p className="text-muted-foreground mb-8">
            Watch ESPN Network live baseball coverage and analysis
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Coverage</CardTitle>
                <Tv className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24/7</div>
                <p className="text-xs text-muted-foreground">Baseball Analysis</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viewers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">50K+</div>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                <Radio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">MLB</div>
                <p className="text-xs text-muted-foreground">All Teams</p>
              </CardContent>
            </Card>
          </div>

          {/* Stream Player */}
          <StreamPlayer 
            pageName="espn-network"
            pageTitle="ESPN Network"
            pageDescription="Watch ESPN Network live baseball coverage and analysis"
          />

          {/* Featured Shows */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Featured Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Baseball Tonight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Daily baseball news and highlights
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>SportsCenter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Latest sports news and updates
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>MLB Live</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Live game coverage and analysis
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Today's Games */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Today's Schedule</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Baseball Tonight</p>
                      <p className="text-sm text-muted-foreground">7:00 PM ET</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      Live Soon
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">SportsCenter Special</p>
                      <p className="text-sm text-muted-foreground">9:00 PM ET</p>
                    </div>
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                      Scheduled
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ESPNNetwork;
