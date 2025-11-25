import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function SpringTraining() {
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
    },
  });

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Spring Training 2026</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Get ready for the upcoming spring training season. Follow the Mets as they prepare for another exciting year.
          </p>
          <Link to="/mets-schedule-2026" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <Calendar className="w-4 h-4" />
            View Full 2026 Regular Season Schedule
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading games...</p>
        ) : games && games.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {games.map((game) => (
              <Card key={game.id} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={game.preview_image_url}
                    alt={`Mets vs ${game.opponent}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <CardContent className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Mets vs {game.opponent}
                    </h3>
                    <p className="text-white/90">Spring Training Matchup</p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No spring training games scheduled yet.</p>
        )}
      </div>
    </section>
  );
}