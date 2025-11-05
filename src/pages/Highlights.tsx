import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Share2, Play, Search, Filter } from "lucide-react";
import highlightImage from "@/assets/highlight-1.jpg";

const Highlights = () => {
  const highlights = [
    {
      title: "The biggest home runs we hit at Citi Field this season",
      views: "45K",
      duration: "3:42",
      category: "Home Runs",
    },
    {
      title: "Best defensive plays from last week",
      views: "32K",
      duration: "5:18",
      category: "Defense",
    },
    {
      title: "Francisco Lindor's incredible catch saves the game",
      views: "78K",
      duration: "1:24",
      category: "Top Plays",
    },
    {
      title: "Walk-off win against the Phillies highlights",
      views: "91K",
      duration: "6:45",
      category: "Game Winners",
    },
    {
      title: "Pete Alonso power showcase - Season compilation",
      views: "58K",
      duration: "8:12",
      category: "Player Focus",
    },
    {
      title: "Best moments from rivalry week",
      views: "42K",
      duration: "4:33",
      category: "Rivalries",
    },
  ];

  const categories = ["All", "Home Runs", "Defense", "Top Plays", "Game Winners", "Player Focus"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Game Highlights
              </h1>
              <p className="text-lg text-foreground max-w-2xl mx-auto">
                Watch the best moments, incredible plays, and unforgettable highlights from Mets games
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input 
                    placeholder="Search highlights..." 
                    className="pl-10 border-2 border-primary bg-card"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>

              <div className="flex gap-2 flex-wrap mt-4">
                {categories.map((category) => (
                  <Badge 
                    key={category}
                    className={category === "All" ? "bg-primary text-primary-foreground cursor-pointer" : "bg-secondary text-secondary-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground"}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((highlight, index) => (
                <Card key={index} className="border-2 border-primary bg-card overflow-hidden group hover:shadow-xl transition-all">
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={highlightImage} 
                      alt={highlight.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-background/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary-foreground ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-semibold text-foreground">
                      {highlight.duration}
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <Badge className="mb-2 bg-primary text-primary-foreground">
                      {highlight.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{highlight.views} views</p>
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
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                Load More Highlights
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Highlights;
