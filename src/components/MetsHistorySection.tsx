import { motion } from "framer-motion";
import { History, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";

const highlights = [
  {
    year: "1969",
    title: "The Miracle Mets",
    description: "From worst to first - the Amazin's shocked the world",
    category: "World Series Champions",
  },
  {
    year: "1986",
    title: "Champions Again",
    description: "Mookie, Doc, Straw & the iconic Game 6",
    category: "World Series Champions",
  },
  {
    year: "2015",
    title: "Return to Glory",
    description: "Murphy's magic run to the Fall Classic",
    category: "NL Champions",
  },
];

const MetsHistorySection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <GlassCard glow="blue" className="p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <History className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    Blast from the Mets Past
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Relive the greatest moments in Mets history
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/mets-history")}
                className="text-primary hover:text-primary/80 gap-1"
              >
                Explore
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Highlights Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => navigate("/mets-history")}
                  className="cursor-pointer group"
                >
                  <Card className="glass-light border-border/30 hover:border-primary/50 transition-all duration-300 h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-black text-primary">{item.year}</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.category}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 text-center">
              <Button
                onClick={() => navigate("/mets-history")}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                Explore Full Mets History
              </Button>
            </div>
          </motion.div>
        </GlassCard>
      </div>
    </section>
  );
};

export default MetsHistorySection;