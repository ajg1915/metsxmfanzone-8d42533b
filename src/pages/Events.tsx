import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ExternalLink, Radio, Podcast, Video, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

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

  const isStandalone = window.location.pathname === '/events';

  const content = (
    <>
      {isStandalone && (
        <section className="relative bg-gradient-to-br from-primary/20 via-background to-background py-6 sm:py-16">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-3xl">
              <h1 className="text-base sm:text-4xl md:text-5xl font-bold text-foreground mb-1 sm:mb-4">
                Upcoming <span className="text-primary">Events</span>
              </h1>
              <p className="text-[10px] sm:text-base md:text-lg text-muted-foreground">
                Join us for exciting Mets fan events and community gatherings.
              </p>
            </div>
          </div>
        </section>
      )}

      {!isStandalone && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-sm sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <p className="text-[10px] sm:text-base text-muted-foreground">
            Join us for exciting community events!
          </p>
        </div>
      )}

      {/* Weekly Podcast Shows Schedule */}
      <section className={isStandalone ? "container mx-auto px-3 sm:px-4 py-4 sm:py-8" : "mb-4 sm:mb-8"}>
        <div className="mb-3 sm:mb-6">
          <h2 className="text-sm sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
            <Podcast className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            Weekly Podcast <span className="text-primary">Shows</span>
          </h2>
          <p className="text-[10px] sm:text-base text-muted-foreground">
            Catch us live every week on Mondays, Wednesdays & Fridays!
          </p>
        </div>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-3 sm:pt-6 sm:p-6">
            {weeklyShows.map((schedule, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                  <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="font-semibold text-[11px] sm:text-lg text-foreground">{schedule.day}</h3>
                </div>
                <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                  {schedule.shows.map((show, showIdx) => {
                    const IconComponent = show.icon;
                    return (
                      <div 
                        key={showIdx}
                        className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="p-1.5 sm:p-3 rounded-full bg-primary/10 flex-shrink-0">
                          <IconComponent className="w-3 h-3 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-bold text-[10px] sm:text-base text-primary">{show.time}</span>
                          </div>
                          <h4 className="font-semibold text-[10px] sm:text-base text-foreground truncate">{show.title}</h4>
                          <p className="text-[9px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{show.description}</p>
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
      <section className={isStandalone ? "container mx-auto px-3 sm:px-4 py-4 sm:py-12" : ""}>
        <div className="mb-3 sm:mb-6">
          <h2 className="text-sm sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            Special <span className="text-primary">Events</span>
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
          </div>
        ) : !events || events.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16 text-center px-3">
              <Calendar className="w-10 h-10 sm:w-16 sm:h-16 text-muted-foreground mb-2 sm:mb-4" />
              <h3 className="text-sm sm:text-xl font-semibold mb-1 sm:mb-2">No Special Events Scheduled</h3>
              <p className="text-[10px] sm:text-base text-muted-foreground">
                Check back soon for exciting events and community gatherings!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border"
              >
                {event.image_url && (
                  <div className="relative w-full h-28 sm:h-48 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}
                <CardHeader className={`${event.image_url ? "-mt-6 sm:-mt-8 relative z-10" : ""} p-3 sm:p-6`}>
                  <CardTitle className="text-xs sm:text-xl group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <span className="flex items-center gap-1 sm:gap-2 text-primary font-medium text-[10px] sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      {format(new Date(event.event_date), "EEEE, MMMM do, yyyy")}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                      <span className="text-[10px] sm:text-sm">
                        {format(new Date(event.event_date), "h:mm a")}
                      </span>
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-[10px] sm:text-sm text-muted-foreground truncate">{event.location}</span>
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  {event.description && (
                    <p className="text-[10px] sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                  {event.external_link && (
                    <Button asChild variant="default" size="sm" className="w-full text-[10px] sm:text-sm h-7 sm:h-9">
                      <a
                        href={event.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 sm:gap-2"
                      >
                        Learn More & Register
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
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

  if (isStandalone) {
    return (
      <>
        <Helmet>
          <title>Events | MetsXMFanZone</title>
          <meta name="description" content="Join us for exciting Mets fan events and community gatherings. Stay updated on upcoming meetups, watch parties, and special events." />
        </Helmet>
        
        <Navigation />
        
        <main className="min-h-screen bg-background pt-12">
          {content}
        </main>
        
        <Footer />
      </>
    );
  }

  return content;
}