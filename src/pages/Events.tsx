import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ExternalLink, Radio, Podcast, Video, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const weeklyShows = [
  {
    day: "Monday, Wednesday & Friday",
    shows: [
      { time: "6:00 AM", title: "Radio Show", icon: Radio, description: "Start your morning with Mets talk and analysis" },
      { time: "8:30 AM", title: "Live Show", icon: Video, description: "Interactive live show with fan call-ins" },
      { time: "5:30 PM", title: "Podcast Stream Live", icon: Podcast, description: "Evening podcast stream with the latest news" },
    ]
  }
];

export default function Events() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Check if this is being rendered as a standalone page or embedded section
  const isStandalone = window.location.pathname === '/events';

  const content = (
    <>
      {/* Hero Section - only show on standalone page */}
      {isStandalone && (
        <section className="relative bg-gradient-to-br from-primary/20 via-background to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Upcoming <span className="text-primary">Events</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Join us for exciting Mets fan events and community gatherings. 
                Connect with fellow fans, enjoy watch parties, and be part of special events!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Section header when embedded */}
      {!isStandalone && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <p className="text-muted-foreground">
            Join us for exciting community events!
          </p>
        </div>
      )}

      {/* Weekly Podcast Shows Schedule */}
      <section className={isStandalone ? "container mx-auto px-4 py-8" : "mb-8"}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Podcast className="w-6 h-6 text-primary" />
            Weekly Podcast <span className="text-primary">Shows</span>
          </h2>
          <p className="text-muted-foreground">
            Catch us live every week on Mondays, Wednesdays & Fridays!
          </p>
        </div>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="pt-6">
            {weeklyShows.map((schedule, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg text-foreground">{schedule.day}</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {schedule.shows.map((show, showIdx) => {
                    const IconComponent = show.icon;
                    return (
                      <div 
                        key={showIdx}
                        className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="p-3 rounded-full bg-primary/10">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-bold text-primary">{show.time}</span>
                          </div>
                          <h4 className="font-semibold text-foreground">{show.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{show.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Events Grid */}
      <section className={isStandalone ? "container mx-auto px-4 py-12" : ""}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Special <span className="text-primary">Events</span>
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !events || events.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Special Events Scheduled</h3>
              <p className="text-muted-foreground">
                Check back soon for exciting events and community gatherings!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border"
              >
                {event.image_url && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}
                <CardHeader className={event.image_url ? "-mt-8 relative z-10" : ""}>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-2 mt-2">
                    <span className="flex items-center gap-2 text-primary font-medium">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.event_date), "EEEE, MMMM do, yyyy")}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">
                        {format(new Date(event.event_date), "h:mm a")}
                      </span>
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{event.location}</span>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  {event.external_link && (
                    <Button asChild variant="default" size="sm" className="w-full">
                      <a
                        href={event.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Learn More & Register
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );

  // If standalone, wrap with Navigation and Footer
  if (isStandalone) {
    return (
      <>
        <SEOHead
          title="Mets Fan Events & Community Gatherings"
          description="Join us for exciting Mets fan events and community gatherings. Stay updated on upcoming meetups, watch parties, and special events."
          keywords="Mets events, Mets meetups, Mets watch party, baseball events, Mets fan gatherings"
          canonical="https://www.metsxmfanzone.com/events"
        />
        
        <Navigation />
        
        <main className="min-h-screen bg-background pt-12">
          {content}
        </main>
        
        <Footer />
      </>
    );
  }

  // If embedded, just return the content
  return content;
}
