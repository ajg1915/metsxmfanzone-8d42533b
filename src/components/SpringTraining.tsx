import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";

interface SpringTrainingProps {
  className?: string;
}

export default function SpringTraining({ className }: SpringTrainingProps) {
  const { data: games, isLoading } = useQuery({
    queryKey: ["spring-training-games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spring_training_games")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  return (
    <section className="py-10 sm:py-12 md:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="font-bold mb-3 sm:mb-4 text-2xl sm:text-3xl">
            Spring Training 2026
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4 text-sm sm:text-base text-center">
            Get ready for the upcoming spring training season. All Season Long.
          </p>
          <Link 
            to="/mets-schedule-2026" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm sm:text-base transition-colors"
          >
            <Calendar className="w-4 h-4" />
            View Full 2026 Regular Season Schedule
          </Link>
        </motion.div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading games...</p>
        ) : games && games.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-10 md:mb-12">
            {games.map((game, index) => (
              <Link key={game.id} to="/spring-training-live">
                <GlassCard
                  variant="interactive"
                  glow="blue"
                  delay={index * 0.1}
                  className="group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={game.preview_image_url} 
                      alt={`Mets vs ${game.opponent}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-foreground mb-2 drop-shadow-lg">
                        Mets vs {game.opponent}
                      </h3>
                      <p className="text-foreground/80 drop-shadow">Spring Training Matchup</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No spring training games scheduled yet.</p>
        )}
      </div>
    </section>
  );
}
