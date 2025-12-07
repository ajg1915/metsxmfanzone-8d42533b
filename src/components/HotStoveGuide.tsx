import { Flame, TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  return <section className="py-8 md:py-12 bg-gradient-to-br from-orange-500/10 via-background to-red-500/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-5">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">MetsXMFanZone Hot Stove </h2>
          <p className="text-muted-foreground mb-8 text-sm max-w-xl mx-auto">
            Your source for the latest MLB offseason news, trades, and free agent signings.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {hotStoveItems.map((item, index) => <Card key={index} className="bg-card/50 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                <CardContent className="p-4 text-center">
                  <item.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </section>;
};
export default HotStoveGuide;