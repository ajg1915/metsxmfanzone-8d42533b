import { useState, useEffect } from "react";
import { Star, Quote, Send, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  content: string;
  rating: number | null;
  location: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const TestimonialsSection = () => {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newLocation, setNewLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Get first name only
  const getFirstName = (fullName: string | null | undefined): string => {
    if (!fullName) return "Mets Fan";
    return fullName.split(" ")[0];
  };

  const fetchTestimonials = async () => {
    try {
      const { data: feedbacks, error } = await supabase
        .from("feedbacks")
        .select("id, content, rating, location, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;

      if (feedbacks && feedbacks.length > 0) {
        // Fetch profiles using the profiles table directly
        const userIds = [...new Set(feedbacks.map(f => f.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        const testimonialsWithProfiles = feedbacks.map(feedback => ({
          ...feedback,
          profile: profiles?.find(p => p.id === feedback.user_id) || null
        }));

        setTestimonials(testimonialsWithProfiles);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (!newReview.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedbacks").insert({
        user_id: user.id,
        content: newReview.trim(),
        rating: newRating,
        location: newLocation.trim() || null
      });

      if (error) throw error;

      toast.success("Thank you for your review!");
      setNewReview("");
      setNewRating(5);
      setNewLocation("");
      setShowForm(false);
      fetchTestimonials();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number | null) => {
    const stars = rating || 5;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= stars ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingSelector = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setNewRating(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              star <= newRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <section className="py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            What Fans Are Saying
          </h2>
          <p className="text-muted-foreground">
            Join our community and share your experience
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card/50 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-16 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 relative group hover:border-primary/30 transition-all duration-300"
              >
                <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/20" />
                <div className="mb-3">{renderStars(testimonial.rating)}</div>
                <p className="text-foreground/90 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {getFirstName(testimonial.profile?.full_name)?.charAt(0)?.toUpperCase() || "F"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground/80">
                      {getFirstName(testimonial.profile?.full_name)}
                    </span>
                    {testimonial.location && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}

        {/* Write Review Section */}
        {user && (
          <div className="mt-8 text-center">
            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Write a Review
              </Button>
            ) : (
              <div className="max-w-md mx-auto bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Share Your Experience
                </h3>
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Your Rating
                  </label>
                  {renderRatingSelector()}
                </div>
                <Textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Tell us what you love about MetsXMFanZone..."
                  className="mb-4 min-h-[100px]"
                  maxLength={500}
                />
                <div className="mb-4">
                  <label className="block text-sm text-muted-foreground mb-2">
                    Where are you from? (optional)
                  </label>
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Queens, NY"
                    maxLength={50}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setNewReview("");
                      setNewRating(5);
                      setNewLocation("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || !newReview.trim()}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
