import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

const LiveNetworks = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12">
          Watch Live Networks
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
          <Card className="border-2 border-primary bg-card hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-primary text-xl">Just Live Baseball Streams</CardTitle>
              <CardDescription className="text-foreground">
                Watch live baseball coverage and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => navigate("/mlb-network")}
              >
                <Play className="w-5 h-5" />
                Watch MLB Network
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary bg-card hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-primary text-xl">MetsXMFanZone Live</CardTitle>
              <CardDescription className="text-foreground">
                Watch exclusive Mets live coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => navigate("/metsxmfanzone-tv")}
              >
                <Play className="w-5 h-5" />
                Watch MetsXMFanZone TV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LiveNetworks;
