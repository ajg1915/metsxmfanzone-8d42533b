import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Feedback {
  id: string;
  content: string;
  rating: number | null;
  created_at: string;
  user_id: string;
}

const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data, error } = await supabase
          .from("feedbacks")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        setFeedbacks(data || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();

    // Set up real-time subscription
    const channel = supabase
      .channel("feedbacks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedbacks",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setFeedbacks((current) => [payload.new as Feedback, ...current].slice(0, 10));
          } else if (payload.eventType === "UPDATE") {
            setFeedbacks((current) =>
              current.map((feedback) =>
                feedback.id === payload.new.id ? (payload.new as Feedback) : feedback
              )
            );
          } else if (payload.eventType === "DELETE") {
            setFeedbacks((current) =>
              current.filter((feedback) => feedback.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12">Community Feedback</h2>
          <div className="text-center text-muted-foreground">Loading feedbacks...</div>
        </div>
      </section>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12">Community Feedback</h2>
          <div className="text-center text-muted-foreground">
            No feedback yet. Be the first to share your thoughts!
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-3xl font-bold text-center mb-12">Community Feedback</h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                {feedback.rating && (
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: feedback.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-3">{feedback.content}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
