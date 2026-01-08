import { useState } from "react";
import { motion } from "framer-motion";
import { History, Trophy, Star, Calendar, Users, Play, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import SEOHead from "@/components/SEOHead";

interface HistoricalMoment {
  year: string;
  title: string;
  description: string;
  category: "championship" | "memorable" | "player" | "milestone";
  image?: string;
}

const historicalMoments: HistoricalMoment[] = [
  {
    year: "1969",
    title: "The Miracle Mets",
    description: "The Mets shocked the world by winning their first World Series, defeating the heavily favored Baltimore Orioles 4-1. From last place to world champions in just their 8th season.",
    category: "championship",
  },
  {
    year: "1986",
    title: "World Champions Again",
    description: "Led by Dwight Gooden, Darryl Strawberry, and Gary Carter, the Mets captured their second World Series title in dramatic fashion against the Boston Red Sox.",
    category: "championship",
  },
  {
    year: "1962",
    title: "The Birth of the Mets",
    description: "The New York Mets played their first game on April 11, 1962, at the Polo Grounds. They finished 40-120, but a new era of New York baseball had begun.",
    category: "milestone",
  },
  {
    year: "1973",
    title: "Ya Gotta Believe!",
    description: "Tug McGraw's famous rallying cry propelled the Mets from last place in August to the National League pennant, facing the Oakland A's in the World Series.",
    category: "memorable",
  },
  {
    year: "1999",
    title: "The Grand Slam Single",
    description: "Robin Ventura hit a walk-off grand slam against the Braves in NLCS Game 5, but was mobbed before touching home - officially a single. One of baseball's most iconic moments.",
    category: "memorable",
  },
  {
    year: "2000",
    title: "Subway Series",
    description: "The Mets faced the Yankees in the first Subway Series since 1956. Though they fell 4-1, the city was electric with baseball fever.",
    category: "memorable",
  },
  {
    year: "2006",
    title: "Endy's Catch",
    description: "Endy Chavez made one of the greatest catches in postseason history, robbing Scott Rolen of a home run in NLCS Game 7 against the Cardinals.",
    category: "memorable",
  },
  {
    year: "2015",
    title: "Return to Glory",
    description: "The young Mets, powered by their dominant rotation and Daniel Murphy's historic postseason, reached the World Series for the first time in 15 years.",
    category: "championship",
  },
  {
    year: "1983",
    title: "Tom Seaver Returns",
    description: "Tom Terrific came back to Shea Stadium, winning his 300th career game as a Met on August 4, 1985. A triumphant return for the franchise's greatest pitcher.",
    category: "player",
  },
  {
    year: "2012",
    title: "R.A. Dickey's Cy Young",
    description: "The knuckleballer became the first Met to win the Cy Young Award since Dwight Gooden in 1985, going 20-6 with a 2.73 ERA.",
    category: "player",
  },
  {
    year: "2018",
    title: "Jacob deGrom's Dominance",
    description: "deGrom won the first of back-to-back Cy Young Awards with a historic 1.70 ERA, cementing himself as one of the game's elite pitchers.",
    category: "player",
  },
  {
    year: "2024",
    title: "OMG - The Grimace Era",
    description: "The Mets went on an improbable run after Grimace threw out the first pitch, becoming one of baseball's most beloved storylines of the season.",
    category: "memorable",
  },
];

const legendaryPlayers = [
  { name: "Tom Seaver", years: "1967-77, 83", number: "41", position: "Pitcher", accolade: "Hall of Fame" },
  { name: "Mike Piazza", years: "1998-2005", number: "31", position: "Catcher", accolade: "Hall of Fame" },
  { name: "Dwight Gooden", years: "1984-94", number: "16", position: "Pitcher", accolade: "Cy Young 1985" },
  { name: "Darryl Strawberry", years: "1983-90", number: "18", position: "Outfield", accolade: "8x All-Star" },
  { name: "Keith Hernandez", years: "1983-89", number: "17", position: "First Base", accolade: "Gold Glove" },
  { name: "David Wright", years: "2004-18", number: "5", position: "Third Base", accolade: "Captain" },
  { name: "Jacob deGrom", years: "2014-22", number: "48", position: "Pitcher", accolade: "2x Cy Young" },
  { name: "Jose Reyes", years: "2003-11, 16-18", number: "7", position: "Shortstop", accolade: "Batting Champ" },
];

const MetsHistory = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredMoments = activeCategory === "all" 
    ? historicalMoments 
    : historicalMoments.filter(m => m.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "championship": return "bg-primary text-primary-foreground";
      case "memorable": return "bg-blue-600 text-white";
      case "player": return "bg-green-600 text-white";
      case "milestone": return "bg-purple-600 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Mets History - Blast from the Past | MetsXMFanZone"
        description="Relive the greatest moments in New York Mets history. From the Miracle Mets of 1969 to modern legends, explore the rich heritage of the Amazin's."
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-blue-900/20" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <BackButton />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mt-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <History className="w-10 h-10 text-primary" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
                Blast from the <span className="text-primary">Mets Past</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Relive the legendary moments, iconic players, and unforgettable memories 
              that have shaped the New York Mets into the Amazin's we love today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Championships Banner */}
      <section className="py-8 bg-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-foreground">1969</p>
              <p className="text-xs text-muted-foreground">World Champions</p>
            </div>
            <div className="text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-foreground">1986</p>
              <p className="text-xs text-muted-foreground">World Champions</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-foreground">5</p>
              <p className="text-xs text-muted-foreground">NL Pennants</p>
            </div>
            <div className="text-center">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-foreground">1962</p>
              <p className="text-xs text-muted-foreground">Founded</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Tabs defaultValue="moments" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 glass-card">
              <TabsTrigger value="moments">Historic Moments</TabsTrigger>
              <TabsTrigger value="legends">Legends</TabsTrigger>
            </TabsList>

            <TabsContent value="moments" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {["all", "championship", "memorable", "player", "milestone"].map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className="capitalize"
                  >
                    {cat === "all" ? "All Moments" : cat}
                  </Button>
                ))}
              </div>

              {/* Timeline */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMoments.map((moment, index) => (
                  <motion.div
                    key={moment.year + moment.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="glass-card border-border/30 h-full hover:border-primary/50 transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl font-black text-primary">{moment.year}</span>
                          <Badge className={getCategoryColor(moment.category)}>
                            {moment.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {moment.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {moment.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="legends" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {legendaryPlayers.map((player, index) => (
                  <motion.div
                    key={player.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="glass-card border-border/30 hover:border-primary/50 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-5 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                          <span className="text-2xl font-black text-primary">#{player.number}</span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{player.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{player.position} • {player.years}</p>
                        <Badge variant="secondary" className="text-xs">
                          {player.accolade}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Fun Facts */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Did You Know? 🤔
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "The Mets were originally going to be called the 'Meadowlarks' before settling on the name 'Mets'",
              "Tom Seaver's number 41 was the first number retired by the Mets organization",
              "Shea Stadium was named after William Shea, the lawyer who brought NL baseball back to New York",
              "The Mets mascot Mr. Met was the first live-action, costumed mascot in MLB history",
              "The 1962 Mets hold the record for most losses in a single season with 120",
              "Mike Piazza's post-9/11 home run is considered one of the most emotional moments in sports history",
            ].map((fact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg glass-card border-border/30"
              >
                <p className="text-sm text-foreground">{fact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MetsHistory;