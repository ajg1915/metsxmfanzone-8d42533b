import { TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/metsxmfanzone-logo.png";
import GlassCard from "@/components/GlassCard";

const HotStoveGuide = () => {
  const hotStoveItems = [{
    icon: Users,
    title: "Free Agent Signings",
    description: "Track the latest free agent moves and contract details"
  }, {
    icon: TrendingUp,
    title: "Trade Rumors",
    description: "Stay updated on potential trades and player movements"
  }, {
    icon: Calendar,
    title: "Key Dates",
    description: "Important offseason deadlines and events"
  }];

  return (
    <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      {/* Blue glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, hsl(220 80% 50% / 0.08), transparent 70%)",
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <GlassCard glow="blue" className="max-w-4xl mx-auto p-6 sm:p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-5">
            <img src={logo} alt="MetsXMFanZone" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            MetsXMFanZone Hot Stove
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
            Your source for the latest MetsXMFanZone offseason news, trades, and free agent signings.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {hotStoveItems.map((item, index) => (
              <Card key={index} className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 sm:p-6 text-center">
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3" />
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default HotStoveGuide;
