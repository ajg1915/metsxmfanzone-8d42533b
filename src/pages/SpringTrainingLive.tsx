import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SpringTraining from "@/components/SpringTraining";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const SpringTrainingLive = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || subLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isPremium && !isAdmin) {
    return <Navigate to="/plans" replace />;
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
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary">Spring Training Live</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Exclusive live coverage of Mets Spring Training from Port St. Lucie, Florida
          </p>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2026</p>
                  <p className="text-sm text-muted-foreground">Season</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Live</p>
                  <p className="text-sm text-muted-foreground">Streaming</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Coverage</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <StreamPlayer 
            pageName="spring-training"
            pageTitle="Spring Training Live Stream"
            pageDescription="Live from Clover Park in Port St. Lucie, FL"
          />

          <div className="mt-12">
            <SpringTraining />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SpringTrainingLive;
