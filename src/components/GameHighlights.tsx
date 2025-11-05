import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import highlightImage from "@/assets/highlight-1.jpg";

const GameHighlights = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Game Highlights
          </h2>
          <Button variant="outline">View All</Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-primary bg-card overflow-hidden group hover:shadow-xl transition-all">
            <div className="aspect-video overflow-hidden">
              <img 
                src={highlightImage} 
                alt="Baseball highlight" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold text-primary mb-2">
                The biggest home runs we hit at Citi Field this season
              </h3>
            </CardContent>
            <CardFooter className="flex gap-4 pt-0">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="w-4 h-4" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GameHighlights;
