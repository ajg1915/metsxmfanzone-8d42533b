import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import PremiumBadge from "@/components/PremiumBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface SpringTrainingProps {
  className?: string;
}

export default function SpringTraining({ className }: SpringTrainingProps) {
  const { tier, isAdmin } = useSubscription();
  const isPremium = isAdmin || tier === "premium" || tier === "annual";
  
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
    <section className="py-8 sm:py-10 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6"
        >
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg sm:text-xl md:text-2xl text-foreground">
              Spring Training 2026
            </h2>
            {!isPremium && <PremiumBadge size="sm" noGlow />}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Get ready for the upcoming spring training season
          </p>
          <Link 
            to="/mets-schedule-2026" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-xs sm:text-sm transition-colors group"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">View Full 2026 Schedule</span>
            <span className="sm:hidden">Full Schedule</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-video bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : games && games.length > 0 ? (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {games.slice(0, 6).map((game, index) => {
              const opponentSlug = game.opponent.toLowerCase().replace(/\s+/g, '').replace('st.louis', 'cardinals').replace('houston', 'astros').replace('atlanta', 'braves').replace('washington', 'nationals').replace('boston', 'redsox').replace('newyork', 'yankees');
              return (
              <Link key={game.id} to={`/matchup/${opponentSlug}`}>
                <GlassCard
                  variant="interactive"
                  glow="blue"
                  delay={index * 0.08}
                  className="group aspect-video overflow-hidden"
                >
                  <div className="relative w-full h-full">
                    <img 
                      src={game.preview_image_url} 
                      alt={`Mets vs ${game.opponent}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    
                    {/* Premium badge for non-members */}
                    {!isPremium && (
                      <PremiumBadge variant="corner" size="sm" noGlow />
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 line-clamp-1 drop-shadow-lg">
                        vs {game.opponent}
                      </h3>
                      <p className="text-xs sm:text-sm text-foreground/80 drop-shadow">Spring Training</p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );})}
          </div>
        ) : (
          <GlassCard variant="default" glow="blue" className="p-6 text-center">
            <p className="text-muted-foreground">No spring training games scheduled yet.</p>
          </GlassCard>
        )}
        
        {games && games.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-4"
          >
            <Button 
              variant="outline" 
              asChild
              size="sm"
              className="text-xs sm:text-sm glass-card border-border/30 hover:border-primary/50"
            >
              <Link to="/spring-training-live">
                See Matchup Overview
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
