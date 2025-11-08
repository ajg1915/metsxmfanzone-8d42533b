import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SpringTraining from "@/components/SpringTraining";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, MapPin } from "lucide-react";
import springTrainingHero from "@/assets/spring-training.jpg";

const SpringTraining2026 = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Mets Spring Training 2026 - Port St. Lucie Schedule & Info | MetsXMFanZone</title>
        <meta name="description" content="Complete 2026 New York Mets Spring Training schedule, game times, and location details. Get all the info for Mets training camp in Port St. Lucie, Florida." />
        <meta name="keywords" content="Mets spring training 2026, Port St. Lucie, Clover Park, spring training schedule, Mets preseason 2026, Grapefruit League" />
        <link rel="canonical" href="https://www.metsxmfanzone.com/spring-training-2026" />
      </Helmet>
      <Navigation />

      <main className="flex-1 pt-16 sm:pt-20">
        {/* Hero Section */}
        <section className="relative h-[400px] sm:h-[500px] overflow-hidden">
          <img 
            src={springTrainingHero}
            alt="Mets Spring Training 2026"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-primary mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                Spring Training 2026
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
                Join us in Port St. Lucie for Mets Spring Training
              </p>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-8 sm:py-12 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              <Card className="border-2 border-primary">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Feb - March</p>
                    <p className="text-sm text-muted-foreground">2026 Season</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Port St. Lucie</p>
                    <p className="text-sm text-muted-foreground">Florida</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardContent className="flex items-center gap-3 p-6">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Clover Park</p>
                    <p className="text-sm text-muted-foreground">Home Field</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto mb-12">
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
                    About Spring Training 2026
                  </h2>
                  <div className="space-y-4 text-foreground">
                    <p>
                      Get ready for an exciting 2026 Spring Training season as the New York Mets return to beautiful Port St. Lucie, Florida! Watch your favorite players prepare for the upcoming season at the state-of-the-art Clover Park facility.
                    </p>
                    <p>
                      Spring Training is the perfect opportunity to see the team up close, get autographs, and enjoy the beautiful Florida weather while watching baseball. Whether you're a lifelong Mets fan or new to the game, Spring Training offers an intimate and exciting baseball experience.
                    </p>
                    <p className="font-semibold text-primary">
                      Location: Clover Park, 525 NW Peacock Blvd, Port St. Lucie, FL 34986
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Schedule */}
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6 sm:mb-8 text-center">
                2026 Spring Training Schedule
              </h2>
              <SpringTraining />
            </div>

            {/* Additional Info */}
            <div className="max-w-4xl mx-auto mt-12">
              <Card className="border-2 border-primary">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-primary mb-4">
                    Plan Your Visit
                  </h3>
                  <div className="space-y-3 text-foreground">
                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Tickets</p>
                        <p className="text-sm text-muted-foreground">Tickets available at the Clover Park box office and online</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Parking</p>
                        <p className="text-sm text-muted-foreground">Free parking available at Clover Park</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Gates Open</p>
                        <p className="text-sm text-muted-foreground">Gates typically open 90 minutes before first pitch</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SpringTraining2026;
